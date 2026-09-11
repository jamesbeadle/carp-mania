import type { CardCarp, CardLake, MarketListingCard, MarketListingsPage } from '$lib/contracts/MarketListingCard';
import { bidSummaryFor, summariseBids, type BidForSummary, type BidSummary } from '$lib/domain/market/bidSummary';
import { MarketPaging, type MarketFilters } from '$lib/domain/market/marketFilters';
import type { Listing, ListingStatus } from '$lib/domain/marketTypes';
import type { Carp } from '$lib/domain/types';
import type { RegionCode } from '$lib/domain/world/regionCodes';
import { requireUser } from '../gates/requireUser';
import { applyMarketFilters, applyMarketSort, marketSelectFor } from './marketListingFilters';

const Open: ListingStatus = 'open';

type CarpEmbed = Pick<Carp, 'id' | 'name' | 'strain' | 'weight_lb' | 'condition' | 'fame' | 'is_catalogued'>;
type LakeEmbed = { id: string; name: string; region: RegionCode };
type ListingRow = Listing & { carp: CarpEmbed; lakes: LakeEmbed | null };

export async function GetMarketListings(locals: App.Locals, filters: MarketFilters): Promise<MarketListingsPage> {
	requireUser(locals);
	const { rows, total } = await loadListingRows(locals, filters);
	const summaries = summariseBids(await loadBidsFor(locals, rows.map((row) => row.id)));
	return {
		cards: rows.map((row) => cardFrom(row, bidSummaryFor(summaries, row.id))),
		filters,
		total,
		pageCount: Math.max(MarketPaging.FirstPage, Math.ceil(total / MarketPaging.PageSize))
	};
}

async function loadListingRows(locals: App.Locals, filters: MarketFilters) {
	const firstRow = (filters.page - MarketPaging.FirstPage) * MarketPaging.PageSize;
	const lastRow = firstRow + MarketPaging.PageSize - 1;
	const openListings = locals.supabase.from('listings').select(marketSelectFor(filters), { count: 'exact' }).eq('status', Open);
	const { data: rows, count } = await applyMarketSort(applyMarketFilters(openListings, filters), filters.sort).range(firstRow, lastRow);
	return { rows: (rows ?? []) as unknown as ListingRow[], total: count ?? 0 };
}

async function loadBidsFor(locals: App.Locals, listingIds: string[]): Promise<BidForSummary[]> {
	if (listingIds.length === 0) return [];
	const { data: bids } = await locals.supabase.from('bids').select('listing_id, amount, status').in('listing_id', listingIds);
	return (bids ?? []) as BidForSummary[];
}

function cardFrom(row: ListingRow, summary: BidSummary): MarketListingCard {
	return {
		id: row.id,
		kind: row.kind,
		startingPrice: Number(row.starting_price),
		buyNowPrice: row.buy_now_price === null ? null : Number(row.buy_now_price),
		endsAt: row.ends_at,
		carp: cardCarpFrom(row.carp),
		lake: row.lakes ? cardLakeFrom(row.lakes) : null,
		leadingBid: summary.leadingBid,
		bidCount: summary.bidCount
	};
}

function cardCarpFrom(carp: CarpEmbed): CardCarp {
	return { id: carp.id, name: carp.name, strain: carp.strain, weightLb: Number(carp.weight_lb), condition: Number(carp.condition), fame: carp.fame, isCatalogued: carp.is_catalogued };
}

function cardLakeFrom(lake: LakeEmbed): CardLake {
	return { id: lake.id, name: lake.name, region: lake.region };
}
