import { isRegionCode, type RegionCode } from '../world/regionCodes';
import { pageNumberFrom } from './paging';

export type WaterSort = 'reputation' | 'biggest' | 'cheapest' | 'newest' | 'most_stock';

export interface WaterFilters {
	region: RegionCode | null;
	sort: WaterSort;
	search: string;
	page: number;
}

export const WaterSorts: { sort: WaterSort; label: string }[] = [
	{ sort: 'reputation', label: 'Best reputation' },
	{ sort: 'biggest', label: 'Biggest fish' },
	{ sort: 'most_stock', label: 'Most stock' },
	{ sort: 'cheapest', label: 'Cheapest ticket' },
	{ sort: 'newest', label: 'Newest water' }
];

export const WaterListing = { PageSize: 12, LongestSearch: 40 } as const;

const DefaultSort: WaterSort = 'reputation';

export function waterFiltersFrom(params: URLSearchParams): WaterFilters {
	const region = params.get('region');
	const sort = params.get('sort');
	return {
		region: region && isRegionCode(region) ? region : null,
		sort: WaterSorts.some((choice) => choice.sort === sort) ? (sort as WaterSort) : DefaultSort,
		search: (params.get('search') ?? '').trim().slice(0, WaterListing.LongestSearch),
		page: pageNumberFrom(params.get('page'))
	};
}

export function waterParamsOf(filters: WaterFilters) {
	return { region: filters.region, sort: filters.sort === DefaultSort ? null : filters.sort, search: filters.search || null };
}
