import type { BedType } from '$lib/domain/types';
import type { SeasonName } from '$lib/domain/world/worldClock';

export type Tint = [number, number, number];

export interface GrassPalette {
	soil: string;
	blades: string[];
	lush: Tint;
	dry: Tint;
}

export interface SoilPalette {
	low: string;
	high: string;
	stones: string[];
	litter: string;
}

export interface BedLook {
	soil: SoilPalette;
	isStony: boolean;
	shingleShare: number;
}

export const GrassPalettes: Record<SeasonName, GrassPalette> = {
	spring: { soil: '#2c2a18', blades: ['#2d4c18', '#44722a', '#5e8f32', '#7aa33e', '#98ae55', '#a89f68'], lush: [0.9, 1.06, 0.82], dry: [1.1, 1.04, 0.74] },
	summer: { soil: '#2e2a19', blades: ['#2b4418', '#3f6326', '#557d30', '#6d8f3a', '#8f9447', '#a49766'], lush: [0.9, 1.05, 0.84], dry: [1.14, 1.02, 0.7] },
	autumn: { soil: '#30291a', blades: ['#35431c', '#4c5c28', '#657536', '#7c8340', '#978a4a', '#a88c5c'], lush: [0.95, 1.03, 0.85], dry: [1.16, 0.98, 0.7] },
	winter: { soil: '#2f2c20', blades: ['#35412a', '#475636', '#5c6b48', '#6f7556', '#7e7a5c', '#8c8466'], lush: [0.95, 1.02, 0.9], dry: [1.08, 1.0, 0.86] }
};

export const Earth: SoilPalette = { low: '#3e3021', high: '#6a5439', stones: ['#8a8378', '#6e6a62', '#9c907a', '#5b5147'], litter: '#2b2116' };

export const Shingle: SoilPalette = { low: '#54493a', high: '#7a6c52', stones: ['#80796d', '#948d80', '#655f57', '#9c8a68', '#7c6849', '#56524d', '#a89f8a', '#6f5e46'], litter: '#3a3024' };

export const BedLooks: Record<BedType, BedLook> = {
	gravel: { soil: { low: '#4f4430', high: '#76684a', stones: ['#7a6c55', '#8c7c60', '#6a5e4c', '#968466', '#5e5446', '#a08d6c'], litter: '#2f281c' }, isStony: true, shingleShare: 0.6 },
	rock: { soil: { low: '#56544c', high: '#7e7a70', stones: ['#8a8984', '#6c6b66', '#9e9a90', '#55534f'], litter: '#2e2d29' }, isStony: true, shingleShare: 0.55 },
	clay: { soil: { low: '#5a432c', high: '#86653f', stones: Earth.stones, litter: '#2e2116' }, isStony: false, shingleShare: 0.35 },
	silt: { soil: { low: '#3a3524', high: '#5a5238', stones: Earth.stones, litter: '#221e14' }, isStony: false, shingleShare: 0.25 }
};

export const Waterside = { underwater: '#2c4234', wetDarkening: 0.45 } as const;
