import type { PageServerLoad } from './$types';
import { GetBiggestFish } from '$lib/server/queries/GetBiggestFish';
import { GetBounties } from '$lib/server/queries/GetBounties';
import { GetWorldActivity, WorldActivityLimit } from '$lib/server/queries/GetWorldActivity';

export const load: PageServerLoad = async ({ locals }) => {
	const [feed, biggestFish, bounties] = await Promise.all([
		GetWorldActivity(locals, { limit: WorldActivityLimit.LiveFeed }), GetBiggestFish(locals.supabase), GetBounties(locals.supabase)
	]);
	return { feed, biggestFish, bounties };
};
