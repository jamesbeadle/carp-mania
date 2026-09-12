import type { PageServerLoad } from './$types';
import { leaderboardScopeFrom } from '$lib/contracts/Leaderboards';
import { GetHallOfFame } from '$lib/server/queries/GetHallOfFame';

const RegionParam = 'region';

export const load: PageServerLoad = ({ locals, url }) => {
	const scope = leaderboardScopeFrom(url.searchParams.get(RegionParam));
	return { scope, hall: GetHallOfFame(locals, scope) };
};
