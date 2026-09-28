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

const Spring: BushPalette = { ...Summer, leaves: ['#3e7024', '#4a7e2a', '#588a32', '#66963a', '#72a040'], fruit: ['#f6f4f0', '#f0eaf0'] };

const Autumn: BushPalette = {
	leaves: ['#4e6424', '#627028', '#8a7a2e', '#9a6a2a', '#3e5a22', '#a0822e'],
	brambleLeaves: ['#34501e', '#44562a', '#6a3a26', '#2e4a1c'],
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
