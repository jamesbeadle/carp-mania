import type { SwimFeature } from '../types';

export const SpotTightness: Record<SwimFeature, number> = {
	snag: 1,
	island_margin: 1,
	gravel_bar: 1,
	reed_line: 0.6,
	lily_pads: 0.6,
	weed_bed: 0.4,
	open_water: 0.2
};

export function spotTightnessOf(feature: SwimFeature) {
	return SpotTightness[feature];
}
