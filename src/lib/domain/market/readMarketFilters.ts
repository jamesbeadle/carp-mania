import { Strains } from '../strains';
import { isRegionCode } from '../world/regionCodes';
import { isWeightBandKey, MarketDefaults, MarketKindFilters, MarketPaging, MarketSortKeys, type MarketFilters } from './marketFilters';

export const MarketParameters = {
	Band: 'band',
	Strain: 'strain',
	MaxPrice: 'price',
	Region: 'region',
	Lake: 'lake',
	Kind: 'kind',
	Sort: 'sort',
	Page: 'page'
} as const;

export function readMarketFilters(searchParams: URLSearchParams): MarketFilters {
	const band = searchParams.get(MarketParameters.Band) ?? '';
	const region = searchParams.get(MarketParameters.Region) ?? '';
	return {
		band: isWeightBandKey(band) ? band : null,
		strain: oneOf(searchParams.get(MarketParameters.Strain), Strains),
		maxPrice: positiveNumberOrNull(searchParams.get(MarketParameters.MaxPrice)),
		region: isRegionCode(region) ? region : null,
		lake: searchParams.get(MarketParameters.Lake) || null,
		kind: oneOf(searchParams.get(MarketParameters.Kind), MarketKindFilters) ?? MarketDefaults.kind,
		sort: oneOf(searchParams.get(MarketParameters.Sort), MarketSortKeys) ?? MarketDefaults.sort,
		page: pageNumberFrom(searchParams.get(MarketParameters.Page))
	};
}

export function marketSearchParams(filters: MarketFilters, pageNumber = filters.page) {
	const parameters = new URLSearchParams();
	if (filters.band) parameters.set(MarketParameters.Band, filters.band);
	if (filters.strain) parameters.set(MarketParameters.Strain, filters.strain);
	if (filters.maxPrice !== null) parameters.set(MarketParameters.MaxPrice, String(filters.maxPrice));
	if (filters.region) parameters.set(MarketParameters.Region, filters.region);
	if (filters.lake) parameters.set(MarketParameters.Lake, filters.lake);
	if (filters.kind !== MarketDefaults.kind) parameters.set(MarketParameters.Kind, filters.kind);
	if (filters.sort !== MarketDefaults.sort) parameters.set(MarketParameters.Sort, filters.sort);
	if (pageNumber !== MarketPaging.FirstPage) parameters.set(MarketParameters.Page, String(pageNumber));
	return parameters;
}

export function marketPathFor(filters: MarketFilters, pageNumber = filters.page) {
	const query = marketSearchParams(filters, pageNumber).toString();
	return query === '' ? '/market' : `/market?${query}`;
}

function oneOf<Choice extends string>(value: string | null, choices: readonly Choice[]): Choice | null {
	const isChoice = value !== null && (choices as readonly string[]).includes(value);
	return isChoice ? (value as Choice) : null;
}

function positiveNumberOrNull(value: string | null) {
	const number = Number(value);
	return value !== null && Number.isFinite(number) && number > 0 ? number : null;
}

function pageNumberFrom(value: string | null) {
	const number = Math.floor(Number(value));
	return Number.isFinite(number) && number >= MarketPaging.FirstPage ? number : MarketPaging.FirstPage;
}
