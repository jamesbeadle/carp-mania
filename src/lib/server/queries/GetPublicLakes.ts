import type { PublicLakeSummary, WatersToFish } from '$lib/contracts/PublicLakeSummary';
import { listPageOf, rangeOf } from '$lib/domain/lists/paging';
import { WaterListing, type WaterFilters, type WaterSort } from '$lib/domain/lists/waterFilters';
import type { Lake } from '$lib/domain/types';
import { requireUser } from '../gates/requireUser';

type SummaryRow = Lake & { owner_name: string; carp_count: number; heaviest_lb: number; swim_count: number };

const SortOrders: Record<WaterSort, { column: string; ascending: boolean }> = {
	reputation: { column: 'reputation', ascending: false },
	biggest: { column: 'heaviest_lb', ascending: false },
	most_stock: { column: 'carp_count', ascending: false },
	cheapest: { column: 'day_ticket_fee', ascending: true },
	newest: { column: 'created_at', ascending: false }
};

export async function GetPublicLakes(locals: App.Locals, filters: WaterFilters): Promise<WatersToFish> {
	requireUser(locals);
	const page = { number: filters.page, size: WaterListing.PageSize };
	const { from, to } = rangeOf(page);
	const order = SortOrders[filters.sort];
	let query = locals.supabase.from('lake_summaries').select('*', { count: 'exact' }).eq('is_public', true).eq('is_setup_complete', true);
	if (filters.region) query = query.eq('region', filters.region);
	if (filters.search) query = query.ilike('name', `%${filters.search}%`);
	const { data, count } = await query.order(order.column, { ascending: order.ascending }).order('id').range(from, to);
	return { page: listPageOf(((data ?? []) as SummaryRow[]).map(summarise), count ?? 0, page), filters };
}

function summarise(row: SummaryRow): PublicLakeSummary {
	const { owner_name, carp_count, heaviest_lb, swim_count, ...lake } = row;
	return { lake: lake as Lake, ownerName: owner_name, carpCount: carp_count, heaviestCarpLb: Number(heaviest_lb), swimCount: swim_count };
}
