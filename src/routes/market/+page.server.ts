import type { PageServerLoad } from './$types';
import { readMarketFilters } from '$lib/domain/market/readMarketFilters';
import { GetMarketIndex } from '$lib/server/queries/GetMarketIndex';
import { GetMarketListings } from '$lib/server/queries/GetMarketListings';

export const load: PageServerLoad = async ({ locals, url }) => {
	const filters = readMarketFilters(url.searchParams);
	const [market, index] = await Promise.all([GetMarketListings(locals, filters), GetMarketIndex(locals)]);
	return { market, index, loadedAt: new Date().toISOString() };
};
