import type { MyBid } from '$lib/contracts/MyMarketActivity';
import { bidSummaryFor, summariseBids } from '$lib/domain/market/bidSummary';
import { splitMyBids } from '$lib/domain/market/myBids';
import type { Bid, BidStatus, Listing, ListingStatus } from '$lib/domain/marketTypes';
import { listedFishFrom, ListedFishColumns, loadBidsOn, type FishEmbed } from './loadMyListings';

const LiveBidStatuses: BidStatus[] = ['leading', 'outbid'];
const Open: ListingStatus = 'open';
const PrivateWater = 'a private water';

type ListingEmbed = Listing & { carp: FishEmbed | null; lakes: { name: string } | null };
type BidRow = Bid & { listings: ListingEmbed };
type BidWithFish = Bid & { listings: ListingEmbed & { carp: FishEmbed } };

export interface MyBids {
	leading: MyBid[];
	outbid: MyBid[];
}

export async function loadMyBids(locals: App.Locals, bidderId: string): Promise<MyBids> {
	const { data: bids } = await locals.supabase
		.from('bids')
		.select(`*, listings!inner(*, carp(${ListedFishColumns}), lakes(name))`)
		.eq('bidder_id', bidderId)
		.in('status', LiveBidStatuses)
		.eq('listings.status', Open)
		.order('placed_at', { ascending: false });
	const { leading, outbid } = splitMyBids(((bids ?? []) as BidRow[]).filter(hasVisibleFish));
	const summaries = summariseBids(await loadBidsOn(locals, outbid.map((row) => row.listing_id)));
	return {
		leading: leading.map((row) => myBidFrom(row, Number(row.amount))),
		outbid: outbid.map((row) => myBidFrom(row, bidSummaryFor(summaries, row.listing_id).leadingBid))
	};
}

function hasVisibleFish(row: BidRow): row is BidWithFish {
	return row.listings.carp !== null;
}

function myBidFrom(row: BidWithFish, leadingBid: number | null): MyBid {
	const { listings, ...bid } = row;
	const { carp, lakes, ...listing } = listings;
	return { bid, listing, fish: listedFishFrom(carp), lakeName: lakes?.name ?? PrivateWater, leadingBid };
}
