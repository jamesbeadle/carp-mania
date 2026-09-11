import type { CarpStrain } from '../types';
import type { RegionCode } from '../world/regionCodes';
import type { ListingKind } from './listingRules';

export interface WeightBand {
	label: string;
	fromLb: number;
	toLb: number | null;
}

export const WeightBandCatalogue = {
	'0s': { label: 'Under 10 lb', fromLb: 0, toLb: 10 },
	'10s': { label: 'Doubles', fromLb: 10, toLb: 20 },
	'20s': { label: 'Twenties', fromLb: 20, toLb: 30 },
	'30s': { label: 'Thirties', fromLb: 30, toLb: 40 },
	'40s': { label: 'Forties', fromLb: 40, toLb: 50 },
	'50s': { label: 'Fifties and up', fromLb: 50, toLb: null }
} as const satisfies Record<string, WeightBand>;

export type WeightBandKey = keyof typeof WeightBandCatalogue;
export const WeightBandKeys = Object.keys(WeightBandCatalogue) as WeightBandKey[];

export function isWeightBandKey(value: string): value is WeightBandKey {
	return (WeightBandKeys as string[]).includes(value);
}

export const MarketSorts = {
	ending_soon: 'Ending soon',
	newest: 'Newest',
	price_low: 'Price: low to high',
	price_high: 'Price: high to low',
	heaviest: 'Heaviest'
} as const;

export type MarketSort = keyof typeof MarketSorts;
export const MarketSortKeys = Object.keys(MarketSorts) as MarketSort[];

export type MarketKindFilter = ListingKind | 'all';
export const MarketKindFilters: MarketKindFilter[] = ['all', 'auction', 'buy_now'];
export const MarketKindLabels: Record<MarketKindFilter, string> = { all: 'All', auction: 'Auctions', buy_now: 'Buy now' };

export const MaximumPriceChoices = [500, 1000, 2500, 5000, 10000, 25000, 50000] as const;

export const MarketPaging = { PageSize: 24, FirstPage: 1 } as const;

export const MarketDefaults = { kind: 'all', sort: 'ending_soon' } as const satisfies { kind: MarketKindFilter; sort: MarketSort };

export interface MarketFilters {
	band: WeightBandKey | null;
	strain: CarpStrain | null;
	maxPrice: number | null;
	region: RegionCode | null;
	lake: string | null;
	kind: MarketKindFilter;
	sort: MarketSort;
	page: number;
}
