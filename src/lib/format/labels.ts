import type { BedType, SwimFeature } from '$lib/domain/types';

export const BedTypeLabels: Record<BedType, string> = { gravel: 'Gravel', clay: 'Clay', silt: 'Silt', rock: 'Rock' };

export const SwimFeatureLabels: Record<SwimFeature, string> = {
	open_water: 'Open water',
	weed_bed: 'Weed bed',
	snag: 'Snags',
	island_margin: 'Island margin',
	reed_line: 'Reed line',
	gravel_bar: 'Gravel bar',
	lily_pads: 'Lily pads'
};

export function humanise(identifier: string) {
	return identifier.replaceAll('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}
