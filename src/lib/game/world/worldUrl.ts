import { isRegionCode } from '$lib/domain/world/regionCodes';
import { isWorldSort, NoWorldFilters, type WorldFilters } from '$lib/domain/world/worldFilters';

export const WorldPath = '/world';

export const WorldParam = {
	Search: 'q',
	Region: 'region',
	Reputation: 'reputation',
	Biggest: 'biggest',
	Fee: 'fee',
	ForSale: 'forSale',
	OnBank: 'onBank',
	Favourites: 'favourites',
	Sort: 'sort',
	Lake: 'lake'
} as const;

const Ticked = '1';

export function filtersFromSearchParams(params: URLSearchParams): WorldFilters {
	const region = params.get(WorldParam.Region) ?? '';
	const sort = params.get(WorldParam.Sort) ?? '';
	return {
		search: params.get(WorldParam.Search) ?? NoWorldFilters.search,
		region: isRegionCode(region) ? region : NoWorldFilters.region,
		minimumReputation: numberOrNull(params.get(WorldParam.Reputation)),
		minimumHeaviestLb: numberOrNull(params.get(WorldParam.Biggest)),
		maximumDayTicketFee: numberOrNull(params.get(WorldParam.Fee)),
		isForSaleOnly: params.get(WorldParam.ForSale) === Ticked,
		isOnTheBankOnly: params.get(WorldParam.OnBank) === Ticked,
		isFavouritesOnly: params.get(WorldParam.Favourites) === Ticked,
		sort: isWorldSort(sort) ? sort : NoWorldFilters.sort
	};
}

export function selectedLakeFrom(params: URLSearchParams): string | null {
	return params.get(WorldParam.Lake);
}

export function worldUrlFor(filters: WorldFilters, selectedLakeId: string | null): string {
	const params = searchParamsFrom(filters, selectedLakeId);
	const query = params.toString();
	return query === '' ? WorldPath : `${WorldPath}?${query}`;
}

export function worldUrlForLake(lakeId: string): string {
	return worldUrlFor(NoWorldFilters, lakeId);
}

function searchParamsFrom(filters: WorldFilters, selectedLakeId: string | null): URLSearchParams {
	const params = new URLSearchParams();
	setIfPresent(params, WorldParam.Search, filters.search.trim());
	setIfPresent(params, WorldParam.Region, filters.region);
	setIfPresent(params, WorldParam.Reputation, filters.minimumReputation);
	setIfPresent(params, WorldParam.Biggest, filters.minimumHeaviestLb);
	setIfPresent(params, WorldParam.Fee, filters.maximumDayTicketFee);
	tickIf(params, WorldParam.ForSale, filters.isForSaleOnly);
	tickIf(params, WorldParam.OnBank, filters.isOnTheBankOnly);
	tickIf(params, WorldParam.Favourites, filters.isFavouritesOnly);
	if (filters.sort !== NoWorldFilters.sort) params.set(WorldParam.Sort, filters.sort);
	setIfPresent(params, WorldParam.Lake, selectedLakeId);
	return params;
}

export function numberOrNull(value: string | null): number | null {
	if (value === null || value.trim() === '') return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function setIfPresent(params: URLSearchParams, key: string, value: string | number | null) {
	if (value === null || value === '') return;
	params.set(key, String(value));
}

function tickIf(params: URLSearchParams, key: string, isTicked: boolean) {
	if (isTicked) params.set(key, Ticked);
}
