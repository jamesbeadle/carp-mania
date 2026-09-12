import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { boardLengthFrom, leaderboardScopeFrom } from '$lib/contracts/Leaderboards';
import { GetLeaderboards } from '$lib/server/queries/GetLeaderboards';

const RegionParam = 'region';
const TopParam = 'top';

export const GET: RequestHandler = async ({ locals, url }) => {
	const scope = leaderboardScopeFrom(url.searchParams.get(RegionParam));
	return json(await GetLeaderboards(locals, scope, boardLengthFrom(url.searchParams.get(TopParam))));
};
