import { tierUnlockedBy, type Tier } from '../tackle/brands';
import { takerThatTookTheBait, type Taker } from '../fishing/takers';
import type { Shoal } from '../stock/shoals';
import type { RegionCode } from '../world/regionCodes';
import { ratingShareOf, sizeReachOf, waterShareOf, type WaterForReach } from '../fishing/sizeReach';
import { noSpotBonus } from '../fishing/takeWeight';
import type { RandomFraction } from '../random';
import type { Carp } from '../types';

export const TierTackleShare: Record<Tier, number> = {
	starter: 0.45,
	club: 0.6,
	specialist: 0.75,
	custom: 0.9
};

export function visitorTackleShareFor(rating: number) {
	return TierTackleShare[tierUnlockedBy(rating)];
}

export function visitorSizeReach(lake: WaterForReach, carpCount: number, rating: number, conditionsShare: number) {
	return sizeReachOf({
		ratingShare: ratingShareOf(rating),
		tackleShare: visitorTackleShareFor(rating),
		conditionsShare,
		waterShare: waterShareOf(lake, carpCount)
	});
}

export function takerForVisitor(lake: WaterForReach & { region: RegionCode }, carp: Carp[], shoals: Shoal[], rating: number, hour: number, conditionsShare: number, random: RandomFraction): Taker | null {
	const take = { sizeReach: visitorSizeReach(lake, carp.length, rating, conditionsShare), hour, spotBonusFor: noSpotBonus };
	return takerThatTookTheBait(carp, shoals, take, random(), lake.region, carp.length);
}
