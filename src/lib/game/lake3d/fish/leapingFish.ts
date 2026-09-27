import { Vector3, type Object3D } from 'three';
import { createCarp } from './carpModel';
import { swimBeat } from './swimmingMaterial';

const Leap = { Seconds: 1.3, Height: 1.1, Length: 0.75, Travel: 1.8 } as const;

export class LeapingFish {
	readonly body: Object3D;
	private age: number = Leap.Seconds;
	private readonly start = new Vector3();
	private heading = 0;
	onEntry: (point: Vector3, isLanding: boolean) => void = () => {};

	constructor() {
		this.body = createCarp('common', swimBeat(9, 0.08));
		this.body.scale.setScalar(Leap.Length);
		this.body.visible = false;
	}

	leapAt(point: Vector3) {
		this.age = 0;
		this.start.copy(point);
		this.heading = Math.random() * Math.PI * 2;
		this.body.visible = true;
		this.onEntry(point, false);
	}

	advance(secondsElapsed: number) {
		if (!this.body.visible) return;
		this.age += secondsElapsed;
		const share = Math.min(1, this.age / Leap.Seconds);
		const across = Leap.Travel * share;
		this.body.position.set(this.start.x + Math.sin(this.heading) * across, 4 * Leap.Height * share * (1 - share) - 0.3, this.start.z + Math.cos(this.heading) * across);
		this.body.rotation.set(-Math.cos(share * Math.PI) * 0.9, this.heading, share * 0.6, 'YXZ');
		if (share < 1) return;
		this.body.visible = false;
		this.onEntry(this.body.position.clone().setY(0), true);
	}
}
