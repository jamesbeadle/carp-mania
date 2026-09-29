import type { WorldPoint } from '../lakeFrame';

export interface RasterFrame {
	originX: number;
	originZ: number;
	texelMetres: number;
	across: number;
	down: number;
}

export const WaterTexel = 1;

export interface ShoreRaster {
	distances: Float32Array;
	nearestRing: Uint8Array;
	isWater: Uint8Array;
}

function centreOf(frame: RasterFrame, column: number, row: number): WorldPoint {
	return { x: frame.originX + (column + 0.5) * frame.texelMetres, z: frame.originZ + (row + 0.5) * frame.texelMetres };
}

function rasteriseEdge(frame: RasterFrame, raster: ShoreRaster, start: WorldPoint, end: WorldPoint, ring: number, band: number) {
	const spanX = end.x - start.x;
	const spanZ = end.z - start.z;
	const lengthSquared = spanX * spanX + spanZ * spanZ || 1;
	const toColumn = (x: number) => Math.min(frame.across - 1, Math.max(0, Math.floor((x - frame.originX) / frame.texelMetres)));
	const toRow = (z: number) => Math.min(frame.down - 1, Math.max(0, Math.floor((z - frame.originZ) / frame.texelMetres)));
	for (let row = toRow(Math.min(start.z, end.z) - band); row <= toRow(Math.max(start.z, end.z) + band); row++) {
		for (let column = toColumn(Math.min(start.x, end.x) - band); column <= toColumn(Math.max(start.x, end.x) + band); column++) {
			const centre = centreOf(frame, column, row);
			const along = Math.min(1, Math.max(0, ((centre.x - start.x) * spanX + (centre.z - start.z) * spanZ) / lengthSquared));
			const awayX = centre.x - start.x - along * spanX;
			const awayZ = centre.z - start.z - along * spanZ;
			const distance = Math.sqrt(awayX * awayX + awayZ * awayZ);
			const texel = row * frame.across + column;
			if (distance >= raster.distances[texel]) continue;
			raster.distances[texel] = distance;
			raster.nearestRing[texel] = ring;
		}
	}
}

function crossingsAt(rings: WorldPoint[][], z: number) {
	const crossings: number[] = [];
	rings.forEach((points) => points.forEach((start, index) => {
		const end = points[(index + 1) % points.length];
		if (start.z > z === end.z > z) return;
		crossings.push(start.x + ((z - start.z) / (end.z - start.z)) * (end.x - start.x));
	}));
	return crossings.sort((first, second) => first - second);
}

function fillWater(frame: RasterFrame, raster: ShoreRaster, rings: WorldPoint[][]) {
	for (let row = 0; row < frame.down; row++) {
		const crossings = crossingsAt(rings, centreOf(frame, 0, row).z);
		for (let pair = 0; pair + 1 < crossings.length; pair += 2) {
			const first = Math.max(0, Math.ceil((crossings[pair] - frame.originX) / frame.texelMetres - 0.5));
			const last = Math.min(frame.across - 1, Math.floor((crossings[pair + 1] - frame.originX) / frame.texelMetres - 0.5));
			raster.isWater.fill(WaterTexel, row * frame.across + first, row * frame.across + last + 1);
		}
	}
}

export function rasteriseShore(frame: RasterFrame, rings: WorldPoint[][], band: number): ShoreRaster {
	const texels = frame.across * frame.down;
	const raster = { distances: new Float32Array(texels).fill(band), nearestRing: new Uint8Array(texels), isWater: new Uint8Array(texels) };
	rings.forEach((points, ring) => points.forEach((start, index) => rasteriseEdge(frame, raster, start, points[(index + 1) % points.length], ring, band)));
	fillWater(frame, raster, rings);
	return raster;
}
