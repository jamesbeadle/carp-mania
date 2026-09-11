import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { leaderboardScopeFrom } from '$lib/contracts/Leaderboards';
import { GetLeaderboards } from '$lib/server/queries/GetLeaderboards';

const RegionParam = 'region';

export const GET: RequestHandler = async ({ locals, url }) => {
	return json(await GetLeaderboards(locals, leaderboardScopeFrom(url.searchParams.get(RegionParam))));
};
