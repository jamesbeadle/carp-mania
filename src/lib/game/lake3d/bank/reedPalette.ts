import type { SeasonName } from '$lib/domain/world/worldClock';

export interface ReedPalette {
	stems: string[];
	leaves: string[];
	plumes: string[];
	maceLeaves: string[];
	maceHeads: string[];
}

const Summer: ReedPalette = {
	stems: ['#5e7a36', '#6c8640', '#7a8c48'],
	leaves: ['#46702a', '#557e30', '#628a38', '#6f9440', '#7e9a4a'],
	plumes: ['#5e4036', '#6a4a3c', '#553a34', '#704e3e', '#4e3630'],
	maceLeaves: ['#5a7e44', '#668a4c', '#729454'],
	maceHeads: ['#4a2e1c', '#56361f', '#3e2616']
};

const Spring: ReedPalette = { ...Summer, leaves: ['#4c7a2c', '#5a8832', '#68943a', '#76a044', '#86aa4e'], plumes: ['#9a8a6c', '#a8987a', '#8c7c60'] };

const Autumn: ReedPalette = {
	stems: ['#a08a58', '#b09a64', '#8e7a4c'],
	leaves: ['#8a8446', '#9e9250', '#b0a060', '#7c7a3e', '#a48a52'],
	plumes: ['#7a5e48', '#8a6a50', '#6a5040', '#947458'],
	maceLeaves: ['#8c8a54', '#a09860', '#7a7a4a'],
	maceHeads: ['#4a2e1c', '#56361f', '#3e2616']
};

const Winter: ReedPalette = {
	stems: ['#8a6e48', '#7a5e3e', '#6e5a44', '#9a7a50', '#5e4e3c'],
	leaves: ['#7a6040', '#6a5238', '#8a6a44', '#5a4a34', '#946e46', '#4e4232'],
	plumes: ['#9a8c78', '#8c806e', '#a89a84', '#7e7262'],
	maceLeaves: ['#8a7048', '#7a6240', '#9a7c50', '#6a5638'],
	maceHeads: ['#4a3220', '#3e2a1a', '#56392a']
};

export const ReedPalettes: Record<SeasonName, ReedPalette> = { spring: Spring, summer: Summer, autumn: Autumn, winter: Winter };
