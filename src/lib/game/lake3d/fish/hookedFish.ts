import { MathUtils, Vector3, type Object3D } from 'three';
import type { CarpStrain } from '$lib/domain/types';
import { carpLengthMetres } from './carpSize';
import { createCarp } from './carpModel';
import { swimBeat } from './swimmingMaterial';

export interface FightMoment {
	progress: number;
	isRunning: boolean;
	tension: number;
}

const Play = { RunGain: 0.18, Settling: 1.6, DeepestMetres: 0.7, SurfacesFrom: 0.8, WeaveSpeed: 0.55, WidestWeave: 10, WeaveShare: 0.25 } as const;
const Beats = { Calm: 6, Running: 13, CalmSweep: 0.06, RunningSweep: 0.1 } as const;

export class HookedFish {
	readonly body: Object3D;
	readonly position = new Vector3();
	private readonly beat = swimBeat(Beats.Calm, Beats.CalmSweep);
	private share = 1;

	constructor(strain: CarpStrain, weightLb: number, private readonly from: Vector3, private readonly net: Vector3) {
		this.body = createCarp(strain, this.beat);
		this.body.scale.setScalar(carpLengthMetres(weightLb));
		this.position.copy(from);
	}

	advance(moment: FightMoment, secondsElapsed: number, timeSeconds: number) {
		const wanted = MathUtils.clamp(1 - moment.progress + (moment.isRunning ? Play.RunGain : 0), 0, 1);
		this.share += (wanted - this.share) * (1 - Math.exp(-Play.Settling * secondsElapsed));
		const previous = this.position.clone();
		this.position.lerpVectors(this.net, this.from, this.share);
		this.weave(timeSeconds);
		this.position.y = -Play.DeepestMetres * MathUtils.clamp((this.share - (1 - Play.SurfacesFrom)) / Play.SurfacesFrom, 0.05, 1);
		this.body.position.copy(this.position);
		this.face(previous);
		this.beat.at(timeSeconds);
		this.beat.pace(moment.isRunning ? Beats.Running : Beats.Calm, moment.isRunning ? Beats.RunningSweep : Beats.CalmSweep);
	}

	get isNearTheNet() {
		return this.share < 1 - Play.SurfacesFrom;
	}

	private weave(timeSeconds: number) {
		const across = new Vector3().subVectors(this.from, this.net).cross(new Vector3(0, 1, 0)).normalize();
		const span = Math.min(Play.WidestWeave, this.from.distanceTo(this.net) * Play.WeaveShare) * this.share;
		this.position.addScaledVector(across, Math.sin(timeSeconds * Play.WeaveSpeed) * span);
	}

	private face(previous: Vector3) {
		const moved = new Vector3().subVectors(this.position, previous);
		if (moved.lengthSq() < 1e-6) return;
		this.body.rotation.set(0, Math.atan2(moved.x, moved.z), 0);
	}
}
