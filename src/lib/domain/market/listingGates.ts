import type { Listing } from '../marketTypes';

type ListingTerms = Pick<Listing, 'status' | 'kind' | 'ends_at' | 'seller_id' | 'buy_now_price'>;

export function whyListingRefusesBid(listing: ListingTerms, bidderId: string, now: Date) {
	if (listing.status !== 'open') return 'That auction has closed';
	if (listing.kind !== 'auction') return 'That fish is buy-now only';
	if (hasEnded(listing, now)) return 'That auction has ended';
	if (listing.seller_id === bidderId) return 'You cannot bid on your own fish';
	return null;
}

export function whyListingRefusesBuyNow(listing: ListingTerms, buyerId: string, now: Date) {
	if (listing.status !== 'open') return 'That fish has already gone';
	if (listing.buy_now_price === null) return 'That fish has no buy-now price; bid for it instead';
	if (hasEnded(listing, now)) return 'That listing has ended';
	if (listing.seller_id === buyerId) return 'You cannot buy your own fish';
	return null;
}

export function whyListingCannotBeCancelled(listing: Pick<Listing, 'status' | 'seller_id'>, sellerId: string, bidCount: number) {
	if (listing.seller_id !== sellerId) return 'That listing is not yours';
	if (listing.status !== 'open') return 'That listing has already closed';
	if (bidCount > 0) return 'You cannot cancel once someone has bid';
	return null;
}

function hasEnded(listing: Pick<Listing, 'ends_at'>, now: Date) {
	return new Date(listing.ends_at).getTime() <= now.getTime();
}
