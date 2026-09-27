import { Group, Mesh, MeshBasicMaterial, RingGeometry, type Vector3 } from 'three';

const Rings = { Pool: 24, Seconds: 2.6, Widest: 3.2, Width: 0.06, Opacity: 0.55, Lift: 0.03, Smallest: 0.15, Sides: 48 } as const;
const RingColour = '#f2f7f2';

class Ring {
	readonly mesh: Mesh;
	private readonly material = new MeshBasicMaterial({ color: RingColour, transparent: true, opacity: 0, depthWrite: false });
	private age: number = Rings.Seconds;
	private widest: number = Rings.Widest;

	constructor() {
		this.mesh = new Mesh(new RingGeometry(1 - Rings.Width, 1, Rings.Sides), this.material);
		this.mesh.rotateX(-Math.PI / 2);
		this.mesh.visible = false;
	}

	spread(point: Vector3, size: number) {
		this.age = 0;
		this.widest = Rings.Widest * size;
		this.mesh.position.set(point.x, Rings.Lift, point.z);
		this.mesh.visible = true;
	}

	advance(secondsElapsed: number) {
		if (!this.mesh.visible) return;
		this.age += secondsElapsed;
		const share = this.age / Rings.Seconds;
		this.mesh.visible = share < 1;
		this.mesh.scale.setScalar(Rings.Smallest + share * this.widest);
		this.material.opacity = Rings.Opacity * (1 - share);
	}
}

export class WaterRings {
	readonly group = new Group();
	private readonly rings = Array.from({ length: Rings.Pool }, () => new Ring());
	private next = 0;

	constructor() {
		this.group.add(...this.rings.map((ring) => ring.mesh));
	}

	ripple(point: Vector3, size = 1) {
		this.rings[this.next].spread(point, size);
		this.next = (this.next + 1) % Rings.Pool;
	}

	advance(secondsElapsed: number) {
		this.rings.forEach((ring) => ring.advance(secondsElapsed));
	}
}
