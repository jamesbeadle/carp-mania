import type { Actions, PageServerLoad } from './$types';
import { NameHeir } from '$lib/server/commands/NameHeir';
import { SimulateElapsedTime } from '$lib/server/commands/SimulateElapsedTime';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetFishermanDiary } from '$lib/server/queries/GetFishermanDiary';
import { GetHomeHub } from '$lib/server/queries/GetHomeHub';
import { GetMyFishery } from '$lib/server/queries/GetMyFishery';
import { GetMyMarketActivity } from '$lib/server/queries/GetMyMarketActivity';
import { GetWorldActivity, WorldActivityLimit } from '$lib/server/queries/GetWorldActivity';

export const load: PageServerLoad = async ({ locals }) => {
	const whileAway = await SimulateElapsedTime(locals);
	const [fishery, profile, hub, diary] = await Promise.all([GetMyFishery(locals), loadProfile(locals), GetHomeHub(locals), GetFishermanDiary(locals)]);
	const [worldFeed, marketWatch] = await Promise.all([GetWorldActivity(locals, WorldActivityLimit.HomeHub), GetMyMarketActivity(locals)]);
	return { profile, fishery, whileAway, worldFeed, marketWatch, diary, loadedAt: new Date().toISOString(), isStage: true, ...hub };
};

export const actions: Actions = {
	nameHeir: ({ locals, request }) => request.formData().then((formData) => NameHeir(locals, formData))
};
