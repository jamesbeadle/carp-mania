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
	leaves: ['#2c4e1a', '#355a1e', '#3f6624', '#2a4618', '#4a6e2a'],
	darkLeaves: ['#233c18', '#2a4620', '#335026', '#1e3416', '#3a5626'],
	brambleLeaves: ['#223e18', '#2a481c', '#325220', '#1c3614'],
	canes: ['#4e3628', '#5a4030', '#443024'],
	brambleCanes: ['#5a3a36', '#4e3230', '#66443c'],
	fruit: ['#d8d2c8', '#d0c6c6', '#c8c0b8'],
	leafShare: 1,
	darkLeafShare: 1,
	brambleLeafShare: 1
};

const Spring: BushPalette = {
	...Summer,
	leaves: ['#3a6a22', '#467628', '#528230', '#3e6420', '#5c8a34'],
	darkLeaves: ['#2e5020', '#365a24', '#40662a', '#2a481c'],
	fruit: ['#e0dcd4', '#dcd4d8']
};

const Autumn: BushPalette = {
	leaves: ['#4a5e22', '#5c6a26', '#7c702c', '#8a6026', '#3a5420', '#907a2c'],
	darkLeaves: ['#3a4a1e', '#4a5222', '#6a4a22', '#5a3a1e'],
	brambleLeaves: ['#30481c', '#3e4e26', '#5e3424', '#2a421a', '#6a4a26'],
	canes: ['#4e3628', '#5a4030', '#443024'],
	brambleCanes: ['#5a3438', '#4e2e32', '#643c3e'],
	fruit: ['#1a1016', '#22121c', '#3e121c', '#120c10'],
	leafShare: 0.85,
	darkLeafShare: 0.9,
	brambleLeafShare: 0.8
};

const Winter: BushPalette = {
	leaves: ['#4e4030', '#5a4a36', '#44392a', '#38402a'],
	darkLeaves: ['#2a3a22', '#304026', '#26341e'],
	brambleLeaves: ['#2e3a1e', '#3a3a24', '#4a3626'],
	canes: ['#4a3a30', '#554234', '#40322a'],
	brambleCanes: ['#5a3444', '#4a2c38', '#6a3e48', '#553a2e'],
	fruit: [],
	leafShare: 0.3,
	darkLeafShare: 0.75,
	brambleLeafShare: 0.18
};

export const BushPalettes: Record<SeasonName, BushPalette> = { spring: Spring, summer: Summer, autumn: Autumn, winter: Winter };
