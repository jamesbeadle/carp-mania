import { PerspectiveCamera, Scene, type Object3D } from 'three';
import type { LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { StageConditions } from '../sky/stageConditions';
import { lightTheWindows } from './bank/windowGlow';
import { createBankside } from './lakeBankside';
import { lakeFrameFor, plotReachOf, type LakeFrame, type WorldPoint } from './lakeFrame';
import { Heights } from './lakeGround';
import { createLakeLand } from './terrain/lakeLand';
import { LakeWater } from './lakeWater';
import { SkyAndLight } from './skyAndLight';
import { Vegetation } from './vegetation';
import { Clouds } from './clouds';
import { NearDetailLayer } from './renderQuality';
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
	private readonly clouds = new Clouds();

	constructor(plan: LakeWorldPlan, width: number, height: number) {
		const { layout, season } = plan;
		this.frame = lakeFrameFor(plan.plotAcres);
		const plotReach = plotReachOf(this.frame);
		this.outline = smoothWorldOutline(this.frame, layout.outline);
		this.islands = layout.islands.map((island) => smoothWorldOutline(this.frame, island.points));
		this.camera = new PerspectiveCamera(Lens.FieldOfViewDegrees, width / Math.max(1, height), Lens.Nearest, Lens.Farthest);
		this.sky = new SkyAndLight(this.scene, plotReach * ShadowShareOfPlot, !plan.isDiorama);
		const plotEdge = plan.isDiorama ? { x: this.frame.metresAcross / 2, z: this.frame.metresDown / 2 } : null;
		const bedDepth = bedDepthFor(layout);
		const land = createLakeLand({ outline: this.outline, islands: this.islands, plotEdge, plotReach, season, bed: layout.baseBed, bedDepth, seed: plan.seed });
		this.groundAt = land.groundAt;
		this.water = new LakeWater({ islands: this.islands, bed: { outline: this.outline, deepest: bedDepth, groundAt: this.groundAt }, transparencyPercent: plan.transparencyPercent }, width, height);
		this.water.keepOutOfTheReflection(this.camera, NearDetailLayer);
		const bankside = createBankside(this, { layout, pegs: plan.pegs, season, seed: plan.seed, plotReach, plotEdge, country: land.country });
		this.facilityLabels = bankside.labels;
		this.vegetation = bankside.vegetation;
		this.scene.add(this.clouds.group, this.sky.group, land.group, this.water.mesh, bankside.group);
	}

	get daylight() {
		const { sunlight } = this.sky;
		return sunlight.daylight;
	}

	advance(timeSeconds: number, secondsElapsed: number) {
		this.clouds.advance(secondsElapsed);
		this.water.advance(timeSeconds);
		const { sunlight } = this.sky;
		this.vegetation.blow(timeSeconds, sunlight.windStrength);
	}

	setConditions(conditions: StageConditions) {
		this.sky.setConditions(conditions);
		const { sunlight } = this.sky;
		const { weather } = conditions;
		this.clouds.cover(weather.cloudCover, sunlight.colour, sunlight.daylight, weather.windStrength);
		this.water.light(this.sky.sunlight);
		lightTheWindows(sunlight.daylight);
	}
}
