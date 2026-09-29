import { PerspectiveCamera, Scene, type Object3D } from 'three';
import type { LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { StageConditions } from '../sky/stageConditions';
import { createFacilities } from './bank/facilities3d';
import { lightTheWindows } from './bank/windowGlow';
import { plotFacilities } from './bank/facilityGrounds';
import { lakeFrameFor, plotReachOf, worldPointOf, type LakeFrame, type WorldPoint } from './lakeFrame';
import { Heights } from './lakeGround';
import { fineWorldOutline } from './terrain/fineOutline';
import { createLakeLand } from './terrain/lakeLand';
import { LakeWater } from './lakeWater';
import { SkyAndLight } from './skyAndLight';
import { Vegetation } from './vegetation';
import { NearDetailLayer } from './renderQuality';
import { plantTrees } from './trees/treePlanting';
import { smoothWorldOutline } from './worldShapes';

export interface LakeWorldPlan {
	layout: LakeLayout;
	plotAcres: number;
	transparencyPercent: number;
	season: SeasonName;
	pegs: LayoutPoint[];
	seed: number;
	isDiorama: boolean;
}

const Lens = { FieldOfViewDegrees: 50, Nearest: 0.1, Farthest: 12000 } as const;
const MetresPerFootOfDepth = 0.3048;
const DepthShown = 0.45;
const PegClearing = 10;
const ShadowShareOfPlot = 0.75;

export function bedDepthFor(layout: LakeLayout) {
	return Math.min(Heights.BedDeepest, Math.max(Heights.ShallowestBed, layout.baseDepthFeet * MetresPerFootOfDepth * DepthShown));
}

export class LakeWorld {
	readonly scene = new Scene();
	readonly camera: PerspectiveCamera;
	readonly frame: LakeFrame;
	readonly outline: WorldPoint[];
	readonly islands: WorldPoint[][];
	readonly water: LakeWater;
	readonly sky: SkyAndLight;
	readonly facilityLabels: Object3D[];
	readonly groundAt: (point: WorldPoint) => number;
	private readonly vegetation: Vegetation;

	constructor(plan: LakeWorldPlan, width: number, height: number) {
		const { layout, season } = plan;
		this.frame = lakeFrameFor(plan.plotAcres);
		const plotReach = plotReachOf(this.frame);
		this.outline = smoothWorldOutline(this.frame, layout.outline);
		this.islands = layout.islands.map((island) => smoothWorldOutline(this.frame, island.points));
		const shoreline = { outline: fineWorldOutline(this.frame, layout.outline), islands: layout.islands.map((island) => fineWorldOutline(this.frame, island.points)) };
		this.camera = new PerspectiveCamera(Lens.FieldOfViewDegrees, width / Math.max(1, height), Lens.Nearest, Lens.Farthest);
		this.sky = new SkyAndLight(this.scene, plotReach * ShadowShareOfPlot, !plan.isDiorama);
		const wholePlot = { x: this.frame.metresAcross / 2, z: this.frame.metresDown / 2 };
		const plotEdge = plan.isDiorama ? wholePlot : null;
		this.water = new LakeWater(shoreline.outline, shoreline.islands, plan.transparencyPercent, width, height);
		this.water.keepOutOfTheReflection(this.camera, NearDetailLayer);
		const pegs = plan.pegs.map((peg) => worldPointOf(this.frame, peg));
		const land = createLakeLand({ ...shoreline, swimWater: { outline: this.outline, islands: this.islands }, plotEdge, plotReach, season, bed: layout.baseBed, bedDepth: bedDepthFor(layout), pegs, clock: this.water.clock });
		this.groundAt = land.groundAt;
		this.water.useShoreMap(land.shoreMap);
		const plots = plotFacilities(layout, this, pegs, wholePlot);
		const facilities = createFacilities(plots, this.groundAt);
		this.facilityLabels = facilities.labels;
		const keepClear = [...pegs.map((point) => ({ point, radius: PegClearing })), ...plots.map((plot) => ({ point: plot.point, radius: plot.footprintMetres / 2 }))];
		const woodland = plantTrees({ outline: shoreline.outline, islands: shoreline.islands, keepClear, plotReach, plotEdge, seed: plan.seed });
		this.vegetation = new Vegetation({ woodland, layout, frame: this.frame, outline: shoreline.outline, islands: shoreline.islands, pegs, keepClear, plotEdge, season, seed: plan.seed, groundAt: this.groundAt });
		this.scene.add(this.sky.group, land.group, this.water.mesh, this.vegetation.group, facilities.group);
	}

	get daylight() {
		const { sunlight } = this.sky;
		return sunlight.daylight;
	}

	advance(timeSeconds: number, secondsElapsed: number) {
		this.sky.advance(secondsElapsed);
		this.water.advance(timeSeconds);
		const { sunlight } = this.sky;
		this.vegetation.blow(timeSeconds, sunlight.windStrength);
	}

	setConditions(conditions: StageConditions) {
		this.sky.setConditions(conditions);
		const { sunlight } = this.sky;
		this.water.light(sunlight);
		lightTheWindows(sunlight.daylight);
	}
}
