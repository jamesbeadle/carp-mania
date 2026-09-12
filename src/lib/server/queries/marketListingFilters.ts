import { MarketDefaults, WeightBandCatalogue, type MarketFilters, type MarketSort } from '$lib/domain/market/marketFilters';

export interface FilterableQuery {
	eq(column: string, value: unknown): this;
	lt(column: string, value: unknown): this;
	lte(column: string, value: unknown): this;
	gte(column: string, value: unknown): this;
	order(column: string, options: { ascending: boolean }): this;
}

const CarpColumns = 'id, name, strain, weight_lb, condition, fame, is_catalogued';
const LakeColumns = 'id, name, region';
const EmbeddedCarp = { Strain: 'carp.strain', WeightLb: 'carp.weight_lb' } as const;
const EmbeddedLake = { Region: 'lakes.region' } as const;

const SortOrders: Record<MarketSort, { column: string; ascending: boolean }> = {
	ending_soon: { column: 'ends_at', ascending: true },
	newest: { column: 'created_at', ascending: false },
	price_low: { column: 'starting_price', ascending: true },
	price_high: { column: 'starting_price', ascending: false },
	heaviest: { column: 'carp(weight_lb)', ascending: false }
};

export function marketSelectFor(filters: MarketFilters) {
	const lakeJoin = filters.region ? 'lakes!inner' : 'lakes';
	return `*, carp!inner(${CarpColumns}), ${lakeJoin}(${LakeColumns})`;
}

export function applyMarketFilters<Query extends FilterableQuery>(query: Query, filters: MarketFilters) {
	let filtered = query;
	if (filters.kind !== MarketDefaults.kind) filtered = filtered.eq('kind', filters.kind);
	if (filters.strain) filtered = filtered.eq(EmbeddedCarp.Strain, filters.strain);
	if (filters.maxPrice !== null) filtered = filtered.lte('starting_price', filters.maxPrice);
	if (filters.region) filtered = filtered.eq(EmbeddedLake.Region, filters.region);
	if (filters.lake) filtered = filtered.eq('lake_id', filters.lake);
	return applyWeightBand(filtered, filters);
}

export function applyMarketSort<Query extends FilterableQuery>(query: Query, sort: MarketSort) {
	const order = SortOrders[sort];
	return query.order(order.column, { ascending: order.ascending }).order('id', { ascending: true });
}

function applyWeightBand<Query extends FilterableQuery>(query: Query, filters: MarketFilters) {
	if (!filters.band) return query;
	const band = WeightBandCatalogue[filters.band];
	const heavyEnough = query.gte(EmbeddedCarp.WeightLb, band.fromLb);
	return band.toLb === null ? heavyEnough : heavyEnough.lt(EmbeddedCarp.WeightLb, band.toLb);
}
