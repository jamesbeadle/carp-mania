import type { Carp } from '../types';
import { guidePriceOf } from './valuation';

export const DealerTerms = {
	ShareOfGuidePrice: 0.55,
	BulkShare: 0.45,
	FullShareFishPerFisheryDay: 3,
	MinimumCondition: 30
} as const;

type Valued = Pick<Carp, 'weight_lb' | 'strain' | 'condition' | 'fame'>;
type Offered = Pick<Carp, 'condition' | 'is_catalogued' | 'transit_until' | 'quarantine_until'>;

export function dealerOfferFor(carp: Valued, soldTodayBefore = 0) {
	const isAtFullShare = soldTodayBefore < DealerTerms.FullShareFishPerFisheryDay;
	const share = isAtFullShare ? DealerTerms.ShareOfGuidePrice : DealerTerms.BulkShare;
	return Math.round(guidePriceOf(carp) * share);
}

export function dealerOffersFor(carp: Valued[], soldTodayBefore: number) {
	return carp.reduce((total, fish, index) => total + dealerOfferFor(fish, soldTodayBefore + index), 0);
}

export function whyDealerRefuses(carp: Offered) {
	if (!carp.is_catalogued) return 'The dealer only buys fish that have been catalogued';
	if (carp.transit_until) return 'That fish is in transit';
	if (carp.quarantine_until) return 'That fish is in quarantine';
	if (Number(carp.condition) < DealerTerms.MinimumCondition) return `The dealer won't take a fish under ${DealerTerms.MinimumCondition} condition`;
	return null;
}
