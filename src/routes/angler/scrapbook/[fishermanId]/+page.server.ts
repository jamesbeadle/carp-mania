import type { PageServerLoad } from './$types';
import { pageNumberFrom } from '$lib/domain/lists/paging';
import { GetScrapbook } from '$lib/server/queries/GetScrapbook';

const HandedDownParam = 'handedDown';
const PageParam = 'page';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const scrapbook = await GetScrapbook(locals, params.fishermanId, pageNumberFrom(url.searchParams.get(PageParam)));
	return { scrapbook, isJustHandedDown: url.searchParams.get(HandedDownParam) === '1' };
};
