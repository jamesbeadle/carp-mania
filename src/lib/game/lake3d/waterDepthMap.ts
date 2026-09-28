import { DataTexture, LinearFilter, RedFormat, Vector4 } from 'three';
import type { WorldPoint } from './lakeFrame';

export interface WaterBed {
	outline: WorldPoint[];
	deepest: number;
	groundAt: (point: WorldPoint) => number;
}

export interface DepthMap {
	texture: DataTexture;
	bounds: Vector4;
}

const Pixels = 200;
const MarginMetres = 3;
const FullByte = 255;

function boundsAround(outline: WorldPoint[]) {
	const xs = outline.map((point) => point.x);
	const zs = outline.map((point) => point.z);
	const least = { x: Math.min(...xs) - MarginMetres, z: Math.min(...zs) - MarginMetres };
	return new Vector4(least.x, least.z, Math.max(...xs) + MarginMetres - least.x, Math.max(...zs) + MarginMetres - least.z);
}

function depthShareAt(bed: WaterBed, point: WorldPoint) {
	const height = bed.groundAt(point);
	return Math.min(1, Math.max(0, -height / bed.deepest));
}

export function waterDepthMap(bed: WaterBed): DepthMap {
	const bounds = boundsAround(bed.outline);
	const data = new Uint8Array(Pixels * Pixels);
	for (let row = 0; row < Pixels; row++) {
		for (let column = 0; column < Pixels; column++) {
			const point = { x: bounds.x + ((column + 0.5) / Pixels) * bounds.z, z: bounds.y + ((row + 0.5) / Pixels) * bounds.w };
			data[row * Pixels + column] = Math.round(depthShareAt(bed, point) * FullByte);
		}
	}
	const texture = new DataTexture(data, Pixels, Pixels, RedFormat);
	texture.magFilter = LinearFilter;
	texture.minFilter = LinearFilter;
	texture.needsUpdate = true;
	return { texture, bounds };
}
