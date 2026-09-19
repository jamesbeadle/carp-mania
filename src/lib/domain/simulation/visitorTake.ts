import { FishingDay } from '../fishing/sessionClock';
import { fractionOfHundred } from '../fraction';
import { pickCarpByWeight } from '../fishing/pickCarp';
import { ratingShareOf, NeutralConditionsShare, sizeReachOf, waterShareOf, type WaterForReach } from '../fishing/sizeReach';
import { noSpotBonus, takeWeightsFor } from '../fishing/takeWeight';
import { randomBetween, type RandomFraction } from '../random';
import type { Carp } from '../types';

export const VisitorTackle = { FloorShare: 0.45, ShareAtFullRating: 0.9 } as const;

export function visitorTackleShareFor(rating: number) {
	const swing = VisitorTackle.ShareAtFullRating - VisitorTackle.FloorShare;
	return VisitorTackle.FloorShare + swing * fractionOfHundred(rating);
}

export function visitorSizeReach(lake: WaterForReach, carpCount: number, rating: number) {
	return sizeReachOf({
		ratingShare: ratingShareOf(rating),
		tackleShare: visitorTackleShareFor(rating),
		conditionsShare: NeutralConditionsShare,
		waterShare: waterShareOf(lake, carpCount)
	});
}

export function carpTakenByVisitor(lake: WaterForReach, carp: Carp[], rating: number, random: RandomFraction): Carp | null {
	const hour = randomBetween(random, FishingDay.StartHour, FishingDay.EndHour);
	const take = { sizeReach: visitorSizeReach(lake, carp.length, rating), hour, spotBonusFor: noSpotBonus };
	return pickCarpByWeight(carp, takeWeightsFor(carp, take), random());
}
