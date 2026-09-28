import type { SeasonName } from '$lib/domain/world/worldClock';

export interface CoverPalette {
	blades: string[];
	dryBlades: string[];
	seedHeads: string[];
	rushes: string[];
	sedges: string[];
	spikes: string[];
	flowerShare: number;
}

const Summer: CoverPalette = {
	blades: ['#2a5216', '#35601a', '#41701f', '#4c7c25', '#5a882c'],
	dryBlades: ['#7a783c', '#6a6c36', '#8a8446'],
	seedHeads: ['#8a784a', '#766644', '#9c8a58'],
	rushes: ['#3c6230', '#48703a', '#557c3e', '#628846', '#6e8e4a'],
	sedges: ['#5f8a34', '#6f9a3e', '#7ea848', '#8aa850'],
	spikes: ['#8a5478', '#9a6488', '#76486a', '#6e5060'],
	flowerShare: 1
};

const Spring: CoverPalette = {
	...Summer,
	blades: ['#326a1a', '#3e7a20', '#4a8a28', '#58962e', '#68a038'],
	seedHeads: ['#8fa060', '#a0a870', '#b4b27c'],
	flowerShare: 1.2
};

const Autumn: CoverPalette = {
	blades: ['#56642a', '#667032', '#78793a', '#8a8446', '#6a6a30'],
	dryBlades: ['#a8925a', '#b8a068', '#9a8450'],
	seedHeads: ['#9a7c52', '#b09064', '#7e6444'],
	rushes: ['#4a5a2c', '#5a6432', '#6e6c3a', '#7a6a3c'],
	sedges: ['#8a8a44', '#9c9450', '#a8985a', '#7c7a3c'],
	spikes: ['#6e5038', '#7e5e44', '#5e4430'],
	flowerShare: 0.25
};

const Winter: CoverPalette = {
	blades: ['#4e5e38', '#586842', '#62704a', '#6a7052', '#54603e'],
	dryBlades: ['#7e7c5a', '#88845e', '#727252'],
	seedHeads: ['#8a7a5e', '#9c8c70', '#76684e'],
	rushes: ['#4c5634', '#58603c', '#646444', '#6c6444'],
	sedges: ['#8a8058', '#968a62', '#7c7450', '#a0946c'],
	spikes: ['#5e4c3a', '#6c5844', '#524232'],
	flowerShare: 0
};

export const CoverPalettes: Record<SeasonName, CoverPalette> = { spring: Spring, summer: Summer, autumn: Autumn, winter: Winter };

export function pickColour(colours: string[], random: () => number) {
	return colours[Math.floor(random() * colours.length)];
}
