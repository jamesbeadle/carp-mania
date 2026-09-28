import { Vector3, type Camera } from 'three';

export interface Distant {
	position: Vector3;
	scale: number;
	detail: number;
}

const MovedEnoughSquared = 4;
const Hysteresis = 0.08;

export class DetailChooser {
	private readonly lastSeenFrom = new Vector3(Infinity, Infinity, Infinity);

	constructor(
		private readonly distants: Distant[],
		private readonly reaches: number[],
		private readonly show: (index: number, detail: number) => void
	) {}

	look(camera: Camera) {
		const { position } = camera;
		const isBelowTheWater = position.y < 0;
		if (isBelowTheWater || position.distanceToSquared(this.lastSeenFrom) < MovedEnoughSquared) return;
		this.lastSeenFrom.copy(position);
		this.distants.forEach((distant, index) => {
			const metres = position.distanceTo(distant.position) / distant.scale;
			const finest = this.detailAt(metres * (1 - Hysteresis));
			const coarsest = this.detailAt(metres * (1 + Hysteresis));
			const detail = Math.min(coarsest, Math.max(finest, distant.detail));
			if (detail === distant.detail) return;
			distant.detail = detail;
			this.show(index, detail);
		});
	}

	private detailAt(metres: number) {
		const closer = this.reaches.findIndex((reach) => metres < reach);
		return closer < 0 ? this.reaches.length : closer;
	}
}
