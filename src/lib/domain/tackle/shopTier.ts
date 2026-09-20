import type { Lake } from '../types';
import { overallWaterQuality } from '../waterQuality';
import { Tiers, type Tier } from './brands';

export const ShopTierMinimumWaterRating: Record<Tier, number> = { starter: 0, club: 35, specialist: 60, custom: 82 };
export const WaterRatingWeights = { Reputation: 0.6, Quality: 0.4 } as const;
export const ShopSpendPerAngler: Record<Tier, number> = { starter: 6, club: 11, specialist: 22, custom: 40 };

export function waterRatingFor(reputation: number, waterQuality: number) {
	return reputation * WaterRatingWeights.Reputation + waterQuality * WaterRatingWeights.Quality;
}

export function shopTierFor(reputation: number, waterQuality: number): Tier {
	const waterRating = waterRatingFor(reputation, waterQuality);
	return [...Tiers].reverse().find((tier) => waterRating >= ShopTierMinimumWaterRating[tier]) ?? 'starter';
}

export function shopTierOf(lake: Pick<Lake, 'reputation' | 'transparency' | 'weed' | 'silt'>): Tier {
	const quality = overallWaterQuality(Number(lake.transparency), Number(lake.weed), Number(lake.silt));
	return shopTierFor(Number(lake.reputation), quality);
}
