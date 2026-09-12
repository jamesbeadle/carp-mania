import type { Bid } from '../marketTypes';

type BidLike = Pick<Bid, 'listing_id' | 'status'>;

export function splitMyBids<MyBid extends BidLike>(bidsNewestFirst: MyBid[]) {
	const leading = bidsNewestFirst.filter((bid) => bid.status === 'leading');
	const listingsLed = new Set(leading.map((bid) => bid.listing_id));
	const listingsSeen = new Set<string>();
	const outbid = bidsNewestFirst.filter((bid) => bid.status === 'outbid' && !listingsLed.has(bid.listing_id) && isFirstSeen(listingsSeen, bid.listing_id));
	return { leading, outbid };
}

function isFirstSeen(seen: Set<string>, listingId: string) {
	if (seen.has(listingId)) return false;
	seen.add(listingId);
	return true;
}
