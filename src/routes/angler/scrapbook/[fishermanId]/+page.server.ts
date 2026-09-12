import type { PageServerLoad } from './$types';
import { GetScrapbook } from '$lib/server/queries/GetScrapbook';

const HandedDownParam = 'handedDown';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	return { scrapbook: await GetScrapbook(locals, params.fishermanId), isJustHandedDown: url.searchParams.get(HandedDownParam) === '1' };
};
