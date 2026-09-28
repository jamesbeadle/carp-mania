import { ClampToEdgeWrapping, DataTexture, LinearFilter, RGBAFormat, Vector2 } from 'three';
import { rasteriseShore, type RasterFrame, type ShoreRaster } from './shoreRaster';
import { Shore } from './shoreProfile';
import type { TerrainShape } from './terrainShape';

export interface ShoreMap {
	texture: DataTexture;
	origin: Vector2;
	size: Vector2;
	bandMetres: number;
	deepestMetres: number;
}

const Baking = { MarginMetres: 3, BandMetres: 10, MostTexels: 2048, DeepestSpare: 0.2 } as const;
const ByteMost = 255;

function frameAround(shape: TerrainShape, texelMetres: number): RasterFrame {
	const { least, most } = shape.lakeBounds;
	const width = most.x - least.x + Baking.MarginMetres * 2;
	const depth = most.z - least.z + Baking.MarginMetres * 2;
	const texel = Math.max(texelMetres, width / Baking.MostTexels, depth / Baking.MostTexels);
	return { originX: least.x - Baking.MarginMetres, originZ: least.z - Baking.MarginMetres, texelMetres: texel, across: Math.ceil(width / texel), down: Math.ceil(depth / texel) };
}

function texelCentre(frame: RasterFrame, texel: number) {
	const column = texel % frame.across;
	const row = Math.floor(texel / frame.across);
	return { x: frame.originX + (column + 0.5) * frame.texelMetres, z: frame.originZ + (row + 0.5) * frame.texelMetres };
}

function encode(shape: TerrainShape, frame: RasterFrame, raster: ShoreRaster, deepest: number) {
	const { distances, nearestRing } = raster;
	const data = new Uint8Array(frame.across * frame.down * 4);
	for (let texel = 0; texel < distances.length; texel++) {
		const isWater = raster.isWater[texel] === 1;
		const distance = distances[texel];
		const height = shape.heightNear(texelCentre(frame, texel), { distance, isWater, isIsland: nearestRing[texel] > 0 });
		const signed = isWater ? distance : -distance;
		data.set([((signed / Baking.BandMetres) * 0.5 + 0.5) * ByteMost, Math.min(1, Math.max(0, -height / deepest)) * ByteMost, 0, ByteMost], texel * 4);
	}
	return data;
}

export function bakeShoreMap(shape: TerrainShape, texelMetres: number): ShoreMap {
	const frame = frameAround(shape, texelMetres);
	const { outline, islands, bedDepth } = shape.plan;
	const raster = rasteriseShore(frame, [outline, ...islands], Baking.BandMetres);
	const deepest = bedDepth + Shore.WaterlineDip + Baking.DeepestSpare;
	const texture = new DataTexture(encode(shape, frame, raster, deepest), frame.across, frame.down, RGBAFormat);
	texture.wrapS = ClampToEdgeWrapping;
	texture.wrapT = ClampToEdgeWrapping;
	texture.magFilter = LinearFilter;
	texture.minFilter = LinearFilter;
	texture.needsUpdate = true;
	const origin = new Vector2(frame.originX, frame.originZ);
	return { texture, origin, size: new Vector2(frame.across * frame.texelMetres, frame.down * frame.texelMetres), bandMetres: Baking.BandMetres, deepestMetres: deepest };
}
