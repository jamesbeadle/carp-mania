import { fail } from '@sveltejs/kit';
import { isAuctionDuration, ListingTerms, type ListingKind } from '$lib/domain/market/listingRules';
import { guidePriceOf } from '$lib/domain/market/valuation';
import type { Carp } from '$lib/domain/types';
import { readFormChoice } from './readFormNumber';
import type { ListingOrder } from './readListingTerms';

export const AtGuideField = 'priceAtGuide';
const ListingKinds: ListingKind[] = ['auction', 'buy_now'];
const Fields = { Kind: 'kind', DurationHours: 'durationHours' } as const;

export interface AtGuideTerms {
	kind: ListingKind;
	durationHours: number | null;
}

export function isPricedAtGuide(formData: FormData) {
	return formData.has(AtGuideField);
}

export function readAtGuideTerms(formData: FormData) {
	const kind = readFormChoice(formData, Fields.Kind, ListingKinds);
	if (kind.failure) return kind;
	const durationHours = kind.value === 'buy_now' ? null : Number(formData.get(Fields.DurationHours));
	const isSoundDuration = durationHours === null || isAuctionDuration(durationHours);
	if (!isSoundDuration) return { value: null, failure: fail(400, { message: `Auctions run for ${ListingTerms.AuctionHours.join(', ')} hours` }) };
	return { value: { kind: kind.value, durationHours }, failure: null };
}

export function orderAtGuideFor(fish: Carp, terms: AtGuideTerms): ListingOrder {
	const guide = Math.max(ListingTerms.MinimumStartingPrice, guidePriceOf(fish));
	const buyNowPrice = terms.kind === 'buy_now' ? guide : null;
	return { kind: terms.kind, startingPrice: guide, reservePrice: null, buyNowPrice, durationHours: terms.durationHours };
}
