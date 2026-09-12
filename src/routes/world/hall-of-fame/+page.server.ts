import type { PageServerLoad } from './$types';
import { leaderboardScopeFrom } from '$lib/contracts/Leaderboards';
import { GetHallOfFame } from '$lib/server/queries/GetHallOfFame';

const RegionParam = 'region';

export const load: PageServerLoad = async ({ locals, url }) => {
	return { hall: await GetHallOfFame(locals, leaderboardScopeFrom(url.searchParams.get(RegionParam))) };
};
