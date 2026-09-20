import { isRegionCode, type RegionCode } from '../world/regionCodes';
import { pageNumberFrom } from './paging';

export type AnglerSort = 'skill' | 'best' | 'landed';

export interface AnglerFilters {
	region: RegionCode | null;
	sort: AnglerSort;
	search: string;
	page: number;
}

export const AnglerSorts: { sort: AnglerSort; label: string }[] = [
	{ sort: 'skill', label: 'Highest rated' },
	{ sort: 'best', label: 'Biggest personal best' },
	{ sort: 'landed', label: 'Most fish landed' }
];

export const AnglerListing = { PageSize: 24, LongestSearch: 40 } as const;

const DefaultSort: AnglerSort = 'skill';

export function anglerFiltersFrom(params: URLSearchParams): AnglerFilters {
	const region = params.get('region');
	const sort = params.get('sort');
	return {
		region: region && isRegionCode(region) ? region : null,
		sort: AnglerSorts.some((choice) => choice.sort === sort) ? (sort as AnglerSort) : DefaultSort,
		search: (params.get('search') ?? '').trim().slice(0, AnglerListing.LongestSearch),
		page: pageNumberFrom(params.get('page'))
	};
}

export function anglerParamsOf(filters: AnglerFilters) {
	return { region: filters.region, sort: filters.sort === DefaultSort ? null : filters.sort, search: filters.search || null };
}
