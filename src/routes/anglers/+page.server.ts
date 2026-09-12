import type { PageServerLoad } from './$types';
import { anglerFiltersFrom } from '$lib/domain/lists/anglerFilters';
import { GetAnglerDirectory } from '$lib/server/queries/GetAnglerDirectory';

export const load: PageServerLoad = async ({ locals, url }) => {
	return { directory: await GetAnglerDirectory(locals, anglerFiltersFrom(url.searchParams)) };
};
