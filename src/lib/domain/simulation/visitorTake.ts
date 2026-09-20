import { tierUnlockedBy, type Tier } from '../tackle/brands';
import { pickCarpByWeight } from '../fishing/pickCarp';
import { ratingShareOf, sizeReachOf, waterShareOf, type WaterForReach } from '../fishing/sizeReach';
import { noSpotBonus, takeWeightsFor } from '../fishing/takeWeight';
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

export function carpTakenByVisitor(lake: WaterForReach, carp: Carp[], rating: number, hour: number, conditionsShare: number, random: RandomFraction): Carp | null {
	const take = { sizeReach: visitorSizeReach(lake, carp.length, rating, conditionsShare), hour, spotBonusFor: noSpotBonus };
	return pickCarpByWeight(carp, takeWeightsFor(carp, take), random());
}
