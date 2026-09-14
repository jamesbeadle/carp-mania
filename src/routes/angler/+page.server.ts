import type { PageServerLoad } from './$types';
import { pageNumberFrom } from '$lib/domain/lists/paging';
import { GetAnglerProfile } from '$lib/server/queries/GetAnglerProfile';
import { GetMyRival } from '$lib/server/queries/GetMyRival';

const PageParam = 'page';

export const load: PageServerLoad = async ({ locals, url }) => {
	return { angler: await GetAnglerProfile(locals, pageNumberFrom(url.searchParams.get(PageParam))), rival: GetMyRival(locals) };
};
