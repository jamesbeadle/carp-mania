import type { PageServerLoad } from './$types';
import { SimulateElapsedTime } from '$lib/server/commands/SimulateElapsedTime';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetHomeHub } from '$lib/server/queries/GetHomeHub';
import { GetMyFishery } from '$lib/server/queries/GetMyFishery';

export const load: PageServerLoad = async ({ locals }) => {
	const whileAway = await SimulateElapsedTime(locals);
	const [fishery, profile, hub] = await Promise.all([GetMyFishery(locals), loadProfile(locals), GetHomeHub(locals)]);
	return { profile, fishery, whileAway, ...hub };
};
