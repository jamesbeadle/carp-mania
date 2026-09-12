import type { Bid, BidStatus } from '../marketTypes';

export interface BidSummary {
	leadingBid: number | null;
	bidCount: number;
}

export type BidForSummary = Pick<Bid, 'listing_id' | 'amount' | 'status'>;

const HoldingStatuses: BidStatus[] = ['leading', 'won'];

export const NoBidsYet: BidSummary = { leadingBid: null, bidCount: 0 };

export function summariseBids(bids: BidForSummary[]) {
	const summaries = new Map<string, BidSummary>();
	for (const bid of bids) {
		const soFar = summaries.get(bid.listing_id) ?? NoBidsYet;
		const leadingBid = HoldingStatuses.includes(bid.status) ? Number(bid.amount) : soFar.leadingBid;
		summaries.set(bid.listing_id, { leadingBid, bidCount: soFar.bidCount + 1 });
	}
	return summaries;
}

export function bidSummaryFor(summaries: Map<string, BidSummary>, listingId: string) {
	return summaries.get(listingId) ?? NoBidsYet;
}

export function currentBidOf(startingPrice: number, leadingBid: number | null) {
	return leadingBid ?? startingPrice;
}
