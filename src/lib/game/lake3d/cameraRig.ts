import { MathUtils, Vector3, type PerspectiveCamera } from 'three';
import type { WorldPoint } from './lakeFrame';
import { Heights } from './lakeGround';
import type { Sightline } from './shadowRange';
import { pointToward } from './worldGeometry';

export type CameraShot = { kind: 'overview'; reach: number } | { kind: 'bank'; swim: WorldPoint; heading: number } | { kind: 'follow'; swim: WorldPoint; heading: number; target: Vector3 } | { kind: 'mat'; swim: WorldPoint; heading: number };

const Overview = { HeightShare: 0.55, DistanceShare: 0.75, DriftPerSecond: 0.02 } as const;
const Bank = { BehindMetres: 1.9, SideMetres: 0.55, EyeHeight: 1.15, LookAheadMetres: 70, LookHeight: 3, MostTurn: 1.1, MostTilt: 0.35 } as const;
const Mat = { BehindMetres: 1.8, Height: 2.1, BackMetres: 1.1, FramedLeftMetres: 0.75 } as const;
const Settling = 2.4;

export class CameraRig {
	private readonly camera: PerspectiveCamera;
	private readonly eye = new Vector3();
	private readonly focus = new Vector3();
	private orbitAngle = 0.6;
	private turn = 0;
	private tilt = 0;
	private zoom = 1;
	private shot: CameraShot = { kind: 'overview', reach: 200 };

	constructor(camera: PerspectiveCamera) {
		this.camera = camera;
	}

	frame(shot: CameraShot) {
		const isNewPlace = shot.kind !== this.shot.kind;
		this.shot = shot;
		if (isNewPlace) this.turn = 0;
		if (isNewPlace && shot.kind === 'mat') this.placeAt(1);
	}

	cut() {
		this.placeAt(1);
	}

	look(across: number, down: number) {
		if (this.shot.kind === 'overview') return void (this.orbitAngle -= across * 0.005);
		this.turn = MathUtils.clamp(this.turn - across * 0.003, -Bank.MostTurn, Bank.MostTurn);
		this.tilt = MathUtils.clamp(this.tilt + down * 0.002, -Bank.MostTilt, Bank.MostTilt);
	}

	get lookTurn() {
		return this.turn;
	}

	get sightline(): Sightline {
		return { eye: this.eye, isOverview: this.shot.kind === 'overview' };
	}

	zoomBy(factor: number) {
		this.zoom = MathUtils.clamp(this.zoom * factor, 0.35, 1.8);
	}

	advance(secondsElapsed: number) {
		if (this.shot.kind === 'overview') this.orbitAngle += Overview.DriftPerSecond * secondsElapsed;
		this.placeAt(1 - Math.exp(-Settling * secondsElapsed));
	}

	private placeAt(share: number) {
		const [eye, focus] = this.aimOf(this.shot);
		this.eye.lerp(eye, share);
		this.focus.lerp(focus, share);
		this.camera.position.copy(this.eye);
		this.camera.lookAt(this.focus);
	}

	private aimOf(shot: CameraShot): [Vector3, Vector3] {
		if (shot.kind === 'overview') return this.overviewAim(shot.reach);
		if (shot.kind === 'mat') return this.matAim(shot.swim, shot.heading);
		const heading = shot.heading + this.turn;
		const behind = pointToward(pointToward(shot.swim, heading + Math.PI, Bank.BehindMetres), heading - Math.PI / 2, Bank.SideMetres);
		const eye = new Vector3(behind.x, Heights.Bank + Bank.EyeHeight, behind.z);
		if (shot.kind === 'follow') return [eye, shot.target.clone()];
		const ahead = pointToward(shot.swim, heading, Bank.LookAheadMetres);
		return [eye, new Vector3(ahead.x, Bank.LookHeight - this.tilt * Bank.LookAheadMetres, ahead.z)];
	}

	private overviewAim(reach: number): [Vector3, Vector3] {
		const distance = reach * Overview.DistanceShare * this.zoom;
		const eye = new Vector3(Math.sin(this.orbitAngle) * distance, reach * Overview.HeightShare * this.zoom, Math.cos(this.orbitAngle) * distance);
		return [eye, new Vector3(0, 0, 0)];
	}

	private matAim(swim: WorldPoint, heading: number): [Vector3, Vector3] {
		const matCentre = pointToward(swim, heading + Math.PI, Mat.BehindMetres);
		const eye = pointToward(matCentre, heading + Math.PI, Mat.BackMetres);
		const framed = pointToward(matCentre, heading - Math.PI / 2, Mat.FramedLeftMetres);
		return [new Vector3(eye.x, Heights.Bank + Mat.Height, eye.z), new Vector3(framed.x, Heights.Bank, framed.z)];
	}

}
