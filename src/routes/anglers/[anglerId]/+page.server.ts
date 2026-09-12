import type { PageServerLoad } from './$types';
import { pageNumberFrom } from '$lib/domain/lists/paging';
import { GetAnglerPublicProfile } from '$lib/server/queries/GetAnglerPublicProfile';

const PageParam = 'page';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	return { angler: await GetAnglerPublicProfile(locals, params.anglerId, pageNumberFrom(url.searchParams.get(PageParam))) };
};
