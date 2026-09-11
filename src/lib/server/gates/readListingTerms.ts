import { fail } from '@sveltejs/kit';
import { isAuctionDuration, ListingTerms, type ListingKind } from '$lib/domain/market/listingRules';
import { formatMoney } from '$lib/format/money';
import { readFormChoice } from './readFormNumber';

export interface ListingOrder {
	kind: ListingKind;
	startingPrice: number;
	reservePrice: number | null;
	buyNowPrice: number | null;
	durationHours: number | null;
}

const ListingKinds: ListingKind[] = ['auction', 'buy_now'];
const HighestPrice = 10_000_000;
const Fields = { Kind: 'kind', StartingPrice: 'startingPrice', ReservePrice: 'reservePrice', BuyNowPrice: 'buyNowPrice', DurationHours: 'durationHours' } as const;

export function readListingTerms(formData: FormData) {
	const kind = readFormChoice(formData, Fields.Kind, ListingKinds);
	if (kind.failure) return kind;
	const prices = readPrices(formData);
	if (prices.failure) return prices;
	const terms = termsFor(kind.value, prices.value, Number(formData.get(Fields.DurationHours)));
	const refusal = whyTermsAreUnsound(terms);
	if (refusal) return refused(refusal);
	return { value: terms, failure: null };
}

function termsFor(kind: ListingKind, prices: Record<'starting' | 'reserve' | 'buyNow', number | null>, durationHours: number): ListingOrder {
	const startingPrice = prices.starting ?? 0;
	if (kind === 'buy_now') return { kind, startingPrice, reservePrice: null, buyNowPrice: startingPrice, durationHours: null };
	return { kind, startingPrice, reservePrice: prices.reserve, buyNowPrice: prices.buyNow, durationHours };
}

function whyTermsAreUnsound(terms: ListingOrder) {
	if (terms.startingPrice < ListingTerms.MinimumStartingPrice) return `The starting price must be at least ${formatMoney(ListingTerms.MinimumStartingPrice)}`;
	if (terms.reservePrice !== null && terms.reservePrice < terms.startingPrice) return 'The reserve cannot be below the starting price';
	if (terms.buyNowPrice !== null && terms.buyNowPrice < terms.startingPrice) return 'The buy-now price cannot be below the starting price';
	if (terms.kind === 'auction' && !isAuctionDuration(terms.durationHours ?? 0)) return `Auctions run for ${ListingTerms.AuctionHours.join(', ')} hours`;
	return null;
}

function readPrices(formData: FormData) {
	const starting = readOptionalPrice(formData, Fields.StartingPrice);
	const reserve = readOptionalPrice(formData, Fields.ReservePrice);
	const buyNow = readOptionalPrice(formData, Fields.BuyNowPrice);
	const failure = starting.failure ?? reserve.failure ?? buyNow.failure;
	if (failure) return { value: null, failure };
	return { value: { starting: starting.value, reserve: reserve.value, buyNow: buyNow.value }, failure: null };
}

function readOptionalPrice(formData: FormData, field: string) {
	const typed = String(formData.get(field) ?? '').trim();
	if (typed === '') return { value: null, failure: null };
	const price = Number(typed);
	const isPrice = Number.isFinite(price) && price > 0 && price <= HighestPrice;
	if (!isPrice) return { value: null, failure: fail(400, { message: `${field} must be a price in pounds` }) };
	return { value: Math.round(price), failure: null };
}

function refused(message: string) {
	return { value: null, failure: fail(400, { message }) };
}
