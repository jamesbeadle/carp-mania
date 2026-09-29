import type { WorldPoint } from '../lakeFrame';
import type { FieldArea, ShoreField } from './shoreField';

const Sampling = { MetresPerNode: 2, ExactNearTheWater: 4 } as const;

export class GroundSampler {
	private readonly across: number;
	private readonly down: number;
	private readonly heights: Float32Array;

	constructor(
		private readonly area: FieldArea,
		private readonly groundAt: (point: WorldPoint) => number,
		private readonly shore: ShoreField
	) {
		const { least, most } = area;
		this.across = Math.ceil((most.x - least.x) / Sampling.MetresPerNode) + 2;
		this.down = Math.ceil((most.z - least.z) / Sampling.MetresPerNode) + 2;
		this.heights = new Float32Array(this.across * this.down).fill(Number.NaN);
	}

	heightAt(point: WorldPoint) {
		const isNearTheWater = this.shore.distanceAt(point) < Sampling.ExactNearTheWater;
		const { least } = this.area;
		const column = (point.x - least.x) / Sampling.MetresPerNode;
		const row = (point.z - least.z) / Sampling.MetresPerNode;
		const isOutside = column < 0 || row < 0 || column >= this.across - 1 || row >= this.down - 1;
		if (isNearTheWater || isOutside) return this.groundAt(point);
		const left = Math.floor(column);
		const top = Math.floor(row);
		const upper = this.nodeAt(left, top) * (1 - (column - left)) + this.nodeAt(left + 1, top) * (column - left);
		const lower = this.nodeAt(left, top + 1) * (1 - (column - left)) + this.nodeAt(left + 1, top + 1) * (column - left);
		return upper * (1 - (row - top)) + lower * (row - top);
	}

	private nodeAt(column: number, row: number) {
		const index = row * this.across + column;
		const known = this.heights[index];
		if (!Number.isNaN(known)) return known;
		const { least } = this.area;
		const height = this.groundAt({ x: least.x + column * Sampling.MetresPerNode, z: least.z + row * Sampling.MetresPerNode });
		this.heights[index] = height;
		return height;
	}
}
