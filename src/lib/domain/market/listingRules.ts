import type { Carp } from '../types';

export type ListingKind = 'auction' | 'buy_now';

export const ListingTerms = {
	FeeShareOfStartingPrice: 0.01,
	MinimumFee: 25,
	CommissionShare: 0.08,
	MinimumStartingPrice: 10,
	MinimumConditionToList: 40,
	MaximumOpenListingsPerLake: 20,
	AuctionHours: [12, 24, 48, 72] as const,
	BuyNowDays: 14,
	AntiSnipingWindowMinutes: 2,
	AntiSnipingExtensionMinutes: 2,
	AntiSnipingMaximumMinutes: 30
} as const;

export function listingFeeFor(startingPrice: number) {
	return Math.max(ListingTerms.MinimumFee, Math.round(startingPrice * ListingTerms.FeeShareOfStartingPrice));
}

export function commissionOn(salePrice: number) {
	return Math.round(salePrice * ListingTerms.CommissionShare);
}

export function sellerReceives(salePrice: number) {
	return salePrice - commissionOn(salePrice);
}

export function whyCarpCannotBeListed(carp: Pick<Carp, 'condition' | 'is_catalogued' | 'transit_until' | 'quarantine_until'>) {
	if (!carp.is_catalogued) return 'A fish must be catalogued before it can be sold';
	if (carp.transit_until) return 'That fish is in transit';
	if (carp.quarantine_until) return 'That fish is in quarantine';
	if (Number(carp.condition) < ListingTerms.MinimumConditionToList) return `A fish under ${ListingTerms.MinimumConditionToList} condition cannot be listed`;
	return null;
}

export function listingEndsAt(kind: ListingKind, durationHours: number, now: Date) {
	const hours = kind === 'auction' ? durationHours : ListingTerms.BuyNowDays * 24;
	return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

export function isAuctionDuration(hours: number): hours is (typeof ListingTerms.AuctionHours)[number] {
	return (ListingTerms.AuctionHours as readonly number[]).includes(hours);
}
