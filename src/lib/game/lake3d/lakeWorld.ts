import { PerspectiveCamera, Scene, type Object3D } from 'three';
import type { LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { StageConditions } from '../sky/stageConditions';
import { createFacilities } from './bank/facilities3d';
import { plotFacilities } from './bank/facilityGrounds';
import { createLakeFeatures } from './bank/lakeFeatures3d';
import { lakeFrameFor, plotReachOf, worldPointOf, type LakeFrame, type WorldPoint } from './lakeFrame';
import { createLakeGround, Heights } from './lakeGround';
import { LakeWater } from './lakeWater';
import { SkyAndLight } from './skyAndLight';
import { createTrees } from './trees3d';
import { plantTrees } from './treePlanting';
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

	constructor(plan: LakeWorldPlan, width: number, height: number) {
		const { layout, season } = plan;
		this.frame = lakeFrameFor(plan.plotAcres);
		const plotReach = plotReachOf(this.frame);
		this.outline = smoothWorldOutline(this.frame, layout.outline);
		this.islands = layout.islands.map((island) => smoothWorldOutline(this.frame, island.points));
		this.camera = new PerspectiveCamera(Lens.FieldOfViewDegrees, width / Math.max(1, height), Lens.Nearest, Lens.Farthest);
		this.sky = new SkyAndLight(this.scene, plotReach * ShadowShareOfPlot, !plan.isDiorama);
		const wholePlot = { x: this.frame.metresAcross / 2, z: this.frame.metresDown / 2 };
		const plotEdge = plan.isDiorama ? wholePlot : null;
		this.water = new LakeWater(this.outline, this.islands, plan.transparencyPercent, width, height);
		const ground = createLakeGround({ outline: this.outline, islands: this.islands, plotEdge, plotReach, season, bed: layout.baseBed, bedDepth: bedDepthFor(layout) });
		const pegs = plan.pegs.map((peg) => worldPointOf(this.frame, peg));
		const plots = plotFacilities(layout, this, pegs, wholePlot);
		const facilities = createFacilities(plots);
		this.facilityLabels = facilities.labels;
		const keepClear = [...pegs.map((point) => ({ point, radius: PegClearing })), ...plots.map((plot) => ({ point: plot.point, radius: plot.footprintMetres / 2 }))];
		const woodland = plantTrees({ outline: this.outline, islands: this.islands, keepClear, plotReach, plotEdge, seed: plan.seed });
		this.scene.add(this.sky.group, ground, this.water.mesh, createTrees(woodland, season), facilities.group, createLakeFeatures(layout, this.frame, season, plan.seed));
	}

	get daylight() {
		const { sunlight } = this.sky;
		return sunlight.daylight;
	}

	advance(timeSeconds: number) {
		this.water.advance(timeSeconds);
	}

	setConditions(conditions: StageConditions) {
		this.sky.setConditions(conditions);
		this.water.light(this.sky.sunlight);
	}
}
