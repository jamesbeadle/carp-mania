import type { RandomFraction } from '../random';
import type { Carp, Lake } from '../types';
import { clampToScale } from '../waterQuality';
import { RegionCatalogue } from '../world/regions';
import type { Season } from '../world/seasons';
import { hasAerator } from './driftWater';

export const Heatwave = {
	DailyChanceAnywhere: 0.01,
	DailyChanceInHotRegions: 0.03,
	HotRegionSummerGrowthFrom: 1.2,
	ShallowLakeBelowFeet: 8,
	ConditionLossShallow: 6,
	ConditionLossDeep: 3
} as const;

export function isHeatwaveToday(lake: Pick<Lake, 'region'>, season: Pick<Season, 'isSummer'>, random: RandomFraction) {
	if (!season.isSummer) return false;
	const isHotRegion = RegionCatalogue[lake.region].summerGrowthFactor >= Heatwave.HotRegionSummerGrowthFrom;
	return random() < (isHotRegion ? Heatwave.DailyChanceInHotRegions : Heatwave.DailyChanceAnywhere);
}

export function sufferHeatwave(lake: Pick<Lake, 'layout'>, carp: Carp[]): Carp[] {
	if (hasAerator(lake)) return carp;
	const isShallow = lake.layout.baseDepthFeet < Heatwave.ShallowLakeBelowFeet;
	const loss = isShallow ? Heatwave.ConditionLossShallow : Heatwave.ConditionLossDeep;
	return carp.map((fish) => ({ ...fish, condition: clampToScale(fish.condition - loss) }));
}
