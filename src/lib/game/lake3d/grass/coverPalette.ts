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
	blades: ['#34631a', '#437520', '#528728', '#619430', '#72a23a'],
	dryBlades: ['#8c8a46', '#7a7c3e', '#9c9452'],
	seedHeads: ['#8a784a', '#766644', '#9c8a58'],
	rushes: ['#35592a', '#406632', '#4b7236', '#57803e'],
	sedges: ['#5f8a34', '#6f9a3e', '#7ea848', '#8aa850'],
	spikes: ['#8e4a78', '#a0588a', '#7a3e66', '#6e4a5a'],
	flowerShare: 1
};

const Spring: CoverPalette = { ...Summer, blades: ['#3c731e', '#4c8526', '#5c962e', '#6ca238', '#7eae44'], seedHeads: ['#8fa060', '#a0a870', '#b4b27c'], flowerShare: 1.2 };

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
	blades: ['#55603e', '#626b48', '#6e7452', '#7c7c5c', '#5a5a40'],
	dryBlades: ['#9a8c6a', '#a89878', '#8a7c5c'],
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
