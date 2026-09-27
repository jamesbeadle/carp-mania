import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Group, Points, PointsMaterial, Vector3, type BufferAttribute } from 'three';

const Splash = { Drops: 70, Pool: 4, Seconds: 1.1, Gravity: 9.8, Speed: 3.2, DropSize: 0.09, Opacity: 0.9, Outward: 0.45 } as const;
const DropColour = '#e8f4ff';

class Burst {
	readonly points: Points;
	private readonly positions: BufferAttribute;
	private readonly material = new PointsMaterial({ color: DropColour, size: Splash.DropSize, transparent: true, opacity: Splash.Opacity, blending: AdditiveBlending, depthWrite: false });
	private readonly velocities = Array.from({ length: Splash.Drops }, () => new Vector3());
	private age: number = Splash.Seconds;

	constructor() {
		const geometry = new BufferGeometry();
		this.positions = new Float32BufferAttribute(new Float32Array(Splash.Drops * 3), 3);
		geometry.setAttribute('position', this.positions);
		this.points = new Points(geometry, this.material);
		this.points.visible = false;
		this.points.frustumCulled = false;
	}

	throwUp(point: Vector3, strength: number) {
		this.age = 0;
		this.points.position.set(point.x, 0, point.z);
		this.points.visible = true;
		this.velocities.forEach((velocity, index) => {
			const angle = Math.random() * Math.PI * 2;
			const outward = Math.random() * Splash.Speed * Splash.Outward * strength;
			velocity.set(Math.cos(angle) * outward, (0.5 + Math.random()) * Splash.Speed * strength, Math.sin(angle) * outward);
			this.positions.setXYZ(index, 0, 0, 0);
		});
	}

	advance(secondsElapsed: number) {
		if (!this.points.visible) return;
		this.age += secondsElapsed;
		this.points.visible = this.age < Splash.Seconds;
		this.velocities.forEach((velocity, index) => this.fall(velocity, index, secondsElapsed));
		this.positions.needsUpdate = true;
		this.material.opacity = Splash.Opacity * (1 - this.age / Splash.Seconds);
	}

	private fall(velocity: Vector3, index: number, secondsElapsed: number) {
		const positions = this.positions;
		velocity.y -= Splash.Gravity * secondsElapsed;
		const height = Math.max(0, positions.getY(index) + velocity.y * secondsElapsed);
		positions.setXYZ(index, positions.getX(index) + velocity.x * secondsElapsed, height, positions.getZ(index) + velocity.z * secondsElapsed);
	}
}

export class Splashes {
	readonly group = new Group();
	private readonly bursts = Array.from({ length: Splash.Pool }, () => new Burst());
	private next = 0;

	constructor() {
		this.group.add(...this.bursts.map((burst) => burst.points));
	}

	splash(point: Vector3, strength = 1) {
		this.bursts[this.next].throwUp(point, strength);
		this.next = (this.next + 1) % Splash.Pool;
	}

	advance(secondsElapsed: number) {
		this.bursts.forEach((burst) => burst.advance(secondsElapsed));
	}
}
