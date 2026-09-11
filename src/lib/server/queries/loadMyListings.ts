import type { ListedFish, MyListing } from '$lib/contracts/MyMarketActivity';
import { bidSummaryFor, summariseBids, type BidForSummary, type BidSummary } from '$lib/domain/market/bidSummary';
import type { Listing } from '$lib/domain/marketTypes';
import type { Carp } from '$lib/domain/types';

const ListingHistoryLimit = 50;

export const ListedFishColumns = 'id, name, strain, weight_lb';
export type FishEmbed = Pick<Carp, 'id' | 'name' | 'strain' | 'weight_lb'>;
type ListingRow = Listing & { carp: FishEmbed | null };
type ListingWithFish = Listing & { carp: FishEmbed };

export async function loadMyListings(locals: App.Locals, sellerId: string): Promise<MyListing[]> {
	const { data: listings } = await locals.supabase
		.from('listings')
		.select(`*, carp(${ListedFishColumns})`)
		.eq('seller_id', sellerId)
		.order('created_at', { ascending: false })
		.limit(ListingHistoryLimit);
	const rows = ((listings ?? []) as ListingRow[]).filter(hasVisibleFish);
	const summaries = summariseBids(await loadBidsOn(locals, rows.map((row) => row.id)));
	return rows.map((row) => myListingFrom(row, summaries));
}

export async function loadBidsOn(locals: App.Locals, listingIds: string[]): Promise<BidForSummary[]> {
	if (listingIds.length === 0) return [];
	const { data: bids } = await locals.supabase.from('bids').select('listing_id, amount, status').in('listing_id', listingIds);
	return (bids ?? []) as BidForSummary[];
}

export function listedFishFrom(fish: FishEmbed): ListedFish {
	return { id: fish.id, name: fish.name, strain: fish.strain, weightLb: Number(fish.weight_lb) };
}

export function isOpenListing(mine: MyListing) {
	return mine.listing.status === 'open';
}

function hasVisibleFish(row: ListingRow): row is ListingWithFish {
	return row.carp !== null;
}

function myListingFrom(row: ListingWithFish, summaries: Map<string, BidSummary>): MyListing {
	const { carp, ...listing } = row;
	return { listing, fish: listedFishFrom(carp), ...bidSummaryFor(summaries, listing.id) };
}
