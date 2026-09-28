import type { DataTexture, Texture } from 'three';
import type { BedType } from '$lib/domain/types';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { grassTile } from './grassTile';
import { groundNoiseTexture } from './groundNoise';
import { BedLooks, Earth, GrassPalettes, Shingle } from './groundPalette';
import { soilTile } from './soilTile';
import { stoneTile } from './stoneTile';

export interface GroundTiles {
	grass: Texture;
	earth: Texture;
	shingle: Texture;
	bed: Texture;
	noise: DataTexture;
}

const MarginStones = { perPixel: 1 / 38, smallestPixels: 2, largestPixels: 10, seed: 83 };
const BedStones = { perPixel: 1 / 60, smallestPixels: 1.5, largestPixels: 8, seed: 97 };
const painted = new Map<string, Texture>();
let noise: DataTexture | null = null;

function remembered(key: string, paint: () => Texture) {
	const known = painted.get(key) ?? paint();
	painted.set(key, known);
	return known;
}

function bedTile(bed: BedType, pixels: number) {
	const look = BedLooks[bed];
	return look.isStony ? stoneTile(pixels, look.soil, BedStones) : soilTile(pixels, look.soil);
}

export function groundTilesFor(season: SeasonName, bed: BedType, pixels: number): GroundTiles {
	noise ??= groundNoiseTexture();
	return {
		grass: remembered(`grass-${season}-${pixels}`, () => grassTile(pixels, GrassPalettes[season])),
		earth: remembered(`earth-${pixels}`, () => soilTile(pixels, Earth)),
		shingle: remembered(`shingle-${pixels}`, () => stoneTile(pixels, Shingle, MarginStones)),
		bed: remembered(`bed-${bed}-${pixels}`, () => bedTile(bed, pixels)),
		noise
	};
}
