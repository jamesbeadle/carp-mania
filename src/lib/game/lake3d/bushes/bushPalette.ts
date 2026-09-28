import type { SeasonName } from '$lib/domain/world/worldClock';

export interface BushPalette {
	leaves: string[];
	brambleLeaves: string[];
	canes: string[];
	fruit: string[];
	leafShare: number;
}

const Summer: BushPalette = {
	leaves: ['#2f5a1e', '#3a6824', '#46742a', '#527e32', '#2a4e1c'],
	brambleLeaves: ['#28481a', '#30541e', '#3a5e24', '#244018'],
	canes: ['#5a3a30', '#6a4436', '#4e3428'],
	fruit: ['#f4f0f0', '#f0e4ec', '#e8dce4'],
	leafShare: 1
};

const Spring: BushPalette = { ...Summer, leaves: ['#3e7024', '#4a7e2a', '#588a32', '#66963a', '#f2f0ea'], fruit: ['#f6f4f0', '#f0eaf0'] };

const Autumn: BushPalette = {
	leaves: ['#6a6a28', '#8a6a2a', '#9a5a26', '#5a5a24', '#a87a30'],
	brambleLeaves: ['#3a4a1e', '#5a3a26', '#6a2e22', '#344418'],
	canes: ['#5a3a30', '#6a4436', '#4e3428'],
	fruit: ['#1e1420', '#2a1a2a', '#8a2030', '#140e16'],
	leafShare: 0.85
};

const Winter: BushPalette = {
	leaves: ['#5a4a34', '#6a563c', '#4e4230', '#3e4a2a'],
	brambleLeaves: ['#2e3e1e', '#3a4424', '#4a3a28'],
	canes: ['#4e3a30', '#5a4436', '#44342a'],
	fruit: ['#7a1e1e', '#8a2424'],
	leafShare: 0.35
};

export const BushPalettes: Record<SeasonName, BushPalette> = { spring: Spring, summer: Summer, autumn: Autumn, winter: Winter };
