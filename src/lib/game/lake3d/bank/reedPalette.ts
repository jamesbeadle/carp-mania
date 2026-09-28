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
	plumes: ['#7a5a5c', '#8a6a64', '#9a7a6e', '#6e5054'],
	maceLeaves: ['#5a7e44', '#668a4c', '#729454'],
	maceHeads: ['#4a2e1c', '#56361f', '#3e2616']
};

const Spring: ReedPalette = { ...Summer, leaves: ['#4c7a2c', '#5a8832', '#68943a', '#76a044', '#86aa4e'], plumes: ['#9a8a6c', '#a8987a', '#8c7c60'] };

const Autumn: ReedPalette = {
	stems: ['#a08a58', '#b09a64', '#8e7a4c'],
	leaves: ['#8a8446', '#9e9250', '#b0a060', '#7c7a3e', '#a48a52'],
	plumes: ['#8a7058', '#9c8266', '#b09478', '#7a6048'],
	maceLeaves: ['#8c8a54', '#a09860', '#7a7a4a'],
	maceHeads: ['#4a2e1c', '#56361f', '#3e2616']
};

const Winter: ReedPalette = {
	stems: ['#948260', '#a08c68', '#887656'],
	leaves: ['#8a7a58', '#988662', '#7c6e50', '#a28e68', '#72664a'],
	plumes: ['#a89878', '#b4a484', '#988a6c', '#8a7c62'],
	maceLeaves: ['#a49470', '#b4a47c', '#948662'],
	maceHeads: ['#5a3c26', '#644430', '#4c321e']
};

export const ReedPalettes: Record<SeasonName, ReedPalette> = { spring: Spring, summer: Summer, autumn: Autumn, winter: Winter };
