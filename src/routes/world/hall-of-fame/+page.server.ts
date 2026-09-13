import type { PageServerLoad } from './$types';
import { leaderboardScopeFrom } from '$lib/contracts/Leaderboards';
import { requireUser } from '$lib/server/gates/requireUser';
import { GetHallOfFame } from '$lib/server/queries/GetHallOfFame';

const RegionParam = 'region';

export const load: PageServerLoad = ({ locals, url }) => {
	const scope = leaderboardScopeFrom(url.searchParams.get(RegionParam));
	return { scope, viewerId: requireUser(locals).id, hall: GetHallOfFame(locals, scope) };
};
