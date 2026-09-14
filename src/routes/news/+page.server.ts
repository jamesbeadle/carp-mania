import type { PageServerLoad } from './$types';
import { GetWorldActivity, WorldActivityLimit } from '$lib/server/queries/GetWorldActivity';

export const load: PageServerLoad = async ({ locals }) => {
	return { feed: await GetWorldActivity(locals, { limit: WorldActivityLimit.LiveFeed }) };
};
