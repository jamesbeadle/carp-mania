import type { PageServerLoad } from './$types';
import { SimulateElapsedTime } from '$lib/server/commands/SimulateElapsedTime';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetHomeHub } from '$lib/server/queries/GetHomeHub';
import { GetMyFishery } from '$lib/server/queries/GetMyFishery';
import { GetMyMarketActivity } from '$lib/server/queries/GetMyMarketActivity';
import { GetWorldActivity, WorldActivityLimit } from '$lib/server/queries/GetWorldActivity';

export const load: PageServerLoad = async ({ locals }) => {
	const whileAway = await SimulateElapsedTime(locals);
	const [fishery, profile, hub] = await Promise.all([GetMyFishery(locals), loadProfile(locals), GetHomeHub(locals)]);
	const worldFeed = await GetWorldActivity(locals, WorldActivityLimit.HomeHub);
	const marketWatch = await GetMyMarketActivity(locals);
	return { profile, fishery, whileAway, worldFeed, marketWatch, loadedAt: new Date().toISOString(), isStage: true, ...hub };
};
