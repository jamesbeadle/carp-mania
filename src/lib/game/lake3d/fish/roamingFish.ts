import { Group, MathUtils, type Object3D } from 'three';
import { seededRandom } from '$lib/domain/random';
import type { CarpStrain } from '$lib/domain/types';
import type { WorldPoint } from '../lakeFrame';
import { isOpenWater, type WaterShape } from '../swimFacing';
import { metresBetween } from '../lakeFrame';
import { carpLengthMetres } from './carpSize';
import { createCarp } from './carpModel';
import { swimBeat } from './swimmingMaterial';

export interface FishToShow {
	strain: CarpStrain;
	weightLb: number;
}

const Roaming = { MostFish: 16, Seed: 97, LeastSpeed: 0.35, SpeedRange: 0.6, LeastDepth: 0.45, DepthRange: 0.9, DeepestShareOfBed: 0.8, Arrived: 3, Turning: 0.9, TargetTries: 20 } as const;
const Beat = { Pace: 4.5, Sweep: 0.05 } as const;
const beat = swimBeat(Beat.Pace, Beat.Sweep);

class Roamer {
	private heading: number;

	constructor(readonly body: Object3D, private target: WorldPoint, private readonly speed: number, heading: number) {
		this.heading = heading;
		body.rotation.set(0, heading, 0);
	}

	swim(secondsElapsed: number, nextTarget: () => WorldPoint) {
		const position = this.body.position;
		const wanted = Math.atan2(this.target.x - position.x, this.target.z - position.z);
		const turn = Math.atan2(Math.sin(wanted - this.heading), Math.cos(wanted - this.heading));
		const mostTurn = Roaming.Turning * secondsElapsed;
		this.heading += MathUtils.clamp(turn, -mostTurn, mostTurn);
		this.body.rotation.set(0, this.heading, 0);
		position.x += Math.sin(this.heading) * this.speed * secondsElapsed;
		position.z += Math.cos(this.heading) * this.speed * secondsElapsed;
		if (metresBetween(this.target, position) < Roaming.Arrived) this.target = nextTarget();
	}
}

export class RoamingFish {
	readonly group = new Group();
	private readonly roamers: Roamer[];
	private readonly random = seededRandom(Roaming.Seed);

	constructor(fish: FishToShow[], private readonly water: WaterShape, bedDepth: number) {
		this.roamers = fish.slice(0, Roaming.MostFish).map((one) => this.roamerFor(one, bedDepth));
		this.group.add(...this.roamers.map((roamer) => roamer.body));
	}

	advance(secondsElapsed: number, timeSeconds: number) {
		beat.at(timeSeconds);
		this.roamers.forEach((roamer) => roamer.swim(secondsElapsed, () => this.somewhereInTheWater()));
	}

	private roamerFor(fish: FishToShow, bedDepth: number) {
		const body = createCarp(fish.strain, beat);
		body.scale.setScalar(carpLengthMetres(fish.weightLb));
		const start = this.somewhereInTheWater();
		const depth = Math.min(bedDepth * Roaming.DeepestShareOfBed, Roaming.LeastDepth + this.random() * Roaming.DepthRange);
		body.position.set(start.x, -depth, start.z);
		return new Roamer(body, this.somewhereInTheWater(), Roaming.LeastSpeed + this.random() * Roaming.SpeedRange, this.random() * Math.PI * 2);
	}

	private somewhereInTheWater(): WorldPoint {
		const xs = this.water.outline.map((point) => point.x);
		const zs = this.water.outline.map((point) => point.z);
		for (let attempt = 0; attempt < Roaming.TargetTries; attempt++) {
			const point = { x: MathUtils.lerp(Math.min(...xs), Math.max(...xs), this.random()), z: MathUtils.lerp(Math.min(...zs), Math.max(...zs), this.random()) };
			if (isOpenWater(point, this.water)) return point;
		}
		return { x: 0, z: 0 };
	}
}
