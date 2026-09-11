import type { Carp } from '../types';
import { guidePriceOf } from './valuation';

export const DealerTerms = {
	ShareOfGuidePrice: 0.55,
	MinimumCondition: 30,
	SalesPerLakePerFisheryDay: 3
} as const;

export function dealerOfferFor(carp: Pick<Carp, 'weight_lb' | 'strain' | 'condition' | 'fame'>) {
	return Math.round(guidePriceOf(carp) * DealerTerms.ShareOfGuidePrice);
}

export function whyDealerRefuses(carp: Pick<Carp, 'condition' | 'is_catalogued' | 'transit_until' | 'quarantine_until'>) {
	if (!carp.is_catalogued) return 'The dealer only buys fish that have been catalogued';
	if (carp.transit_until) return 'That fish is in transit';
	if (carp.quarantine_until) return 'That fish is in quarantine';
	if (Number(carp.condition) < DealerTerms.MinimumCondition) return `The dealer won't take a fish under ${DealerTerms.MinimumCondition} condition`;
	return null;
}
