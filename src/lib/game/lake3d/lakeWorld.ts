import type { Object3D, PerspectiveCamera, Scene } from 'three';
import type { LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { StageConditions } from '../sky/stageConditions';
import { lightTheWindows } from './bank/windowGlow';
import type { LakeFrame, WorldPoint } from './lakeFrame';
import type { LakeWater } from './lakeWater';
import { disposeWorldOf } from './sceneDisposal';
import type { SkyAndLight } from './skyAndLight';
import type { Vegetation } from './vegetation';

export interface LakeWorldPlan {
	layout: LakeLayout;
	plotAcres: number;
	transparencyPercent: number;
	season: SeasonName;
	pegs: LayoutPoint[];
	seed: number;
	isDiorama: boolean;
}

export interface LakeWorldParts {
	scene: Scene;
	camera: PerspectiveCamera;
	frame: LakeFrame;
	outline: WorldPoint[];
	islands: WorldPoint[][];
	water: LakeWater;
	sky: SkyAndLight;
	facilityLabels: Object3D[];
	groundAt: (point: WorldPoint) => number;
	vegetation: Vegetation;
}

export class LakeWorld {
	readonly scene: Scene;
	readonly camera: PerspectiveCamera;
	readonly frame: LakeFrame;
	readonly outline: WorldPoint[];
	readonly islands: WorldPoint[][];
	readonly water: LakeWater;
	readonly sky: SkyAndLight;
	readonly facilityLabels: Object3D[];
	readonly groundAt: (point: WorldPoint) => number;
	private readonly vegetation: Vegetation;

	constructor(parts: LakeWorldParts) {
		this.scene = parts.scene;
		this.camera = parts.camera;
		this.frame = parts.frame;
		this.outline = parts.outline;
		this.islands = parts.islands;
		this.water = parts.water;
		this.sky = parts.sky;
		this.facilityLabels = parts.facilityLabels;
		this.groundAt = parts.groundAt;
		this.vegetation = parts.vegetation;
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

	dispose() {
		this.water.dispose();
		disposeWorldOf(this.scene);
	}
}
