import type { SeasonName } from '$lib/domain/world/worldClock';

export interface BushPalette {
	leaves: string[];
	darkLeaves: string[];
	brambleLeaves: string[];
	canes: string[];
	brambleCanes: string[];
	fruit: string[];
	leafShare: number;
	darkLeafShare: number;
	brambleLeafShare: number;
}

const Summer: BushPalette = {
	leaves: ['#3d6326', '#476e2a', '#50792f', '#3a5e24', '#5a8436'],
	darkLeaves: ['#30521f', '#375c24', '#406629', '#2c4a1d', '#46682c'],
	brambleLeaves: ['#2f5220', '#375c24', '#406428', '#2b4a1c'],
	canes: ['#4e3628', '#5a4030', '#443024'],
	brambleCanes: ['#5a3a36', '#4e3230', '#66443c'],
	fruit: ['#d8d2c8', '#d0c6c6', '#c8c0b8'],
	leafShare: 1,
	darkLeafShare: 1,
	brambleLeafShare: 1
};

const Spring: BushPalette = {
	...Summer,
	leaves: ['#4a7a2a', '#568630', '#629238', '#4c7428', '#6c9a3e'],
	darkLeaves: ['#3a6026', '#426a2a', '#4c7630', '#365824'],
	fruit: ['#e0dcd4', '#dcd4d8']
};

const Autumn: BushPalette = {
	leaves: ['#5e7028', '#72782c', '#948032', '#a0702c', '#4c6426', '#a88a34'],
	darkLeaves: ['#4a5c24', '#5a6228', '#7e5a2a', '#6c4a24'],
	brambleLeaves: ['#3c5622', '#4c5c2c', '#74422c', '#365020', '#7e5a2e'],
	canes: ['#4e3628', '#5a4030', '#443024'],
	brambleCanes: ['#5a3438', '#4e2e32', '#643c3e'],
	fruit: ['#1a1016', '#22121c', '#3e121c', '#120c10'],
	leafShare: 0.85,
	darkLeafShare: 0.9,
	brambleLeafShare: 0.8
};

const Winter: BushPalette = {
	leaves: ['#6a5238', '#76603e', '#5c4a32'],
	darkLeaves: ['#5e4a34', '#6a5a3c', '#54442e'],
	brambleLeaves: ['#2c4420', '#344a24', '#3c4a26', '#4a3e26'],
	canes: ['#5a4a3a', '#66523e', '#4c3e32', '#6e5c48'],
	brambleCanes: ['#5a4034', '#4e3a30', '#664a3a'],
	fruit: [],
	leafShare: 0.12,
	darkLeafShare: 0.18,
	brambleLeafShare: 0.5
};

export const BushPalettes: Record<SeasonName, BushPalette> = { spring: Spring, summer: Summer, autumn: Autumn, winter: Winter };
