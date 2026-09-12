import type { Actions, PageServerLoad } from './$types';
import { NameHeir } from '$lib/server/commands/NameHeir';
import { SimulateElapsedTime } from '$lib/server/commands/SimulateElapsedTime';
import { SwitchWater } from '$lib/server/commands/SwitchWater';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetFishermanDiary } from '$lib/server/queries/GetFishermanDiary';
import { GetHomeHub } from '$lib/server/queries/GetHomeHub';
import { GetMyFishery } from '$lib/server/queries/GetMyFishery';
import { GetMyMarketActivity } from '$lib/server/queries/GetMyMarketActivity';
import { GetWorldActivity, WorldActivityLimit } from '$lib/server/queries/GetWorldActivity';
import { loadMyWaters } from '$lib/server/queries/loadMyWaters';

export const load: PageServerLoad = async ({ locals }) => {
	const whileAway = await SimulateElapsedTime(locals);
	const [fishery, profile, hub, diary] = await Promise.all([GetMyFishery(locals), loadProfile(locals), GetHomeHub(locals), GetFishermanDiary(locals)]);
	const [worldFeed, marketWatch, waters] = await Promise.all([GetWorldActivity(locals, WorldActivityLimit.HomeHub), GetMyMarketActivity(locals), loadMyWaters(locals, profile.id)]);
	return { profile, fishery, whileAway, worldFeed, marketWatch, diary, waters, loadedAt: new Date().toISOString(), isStage: true, ...hub };
};

export const actions: Actions = {
	nameHeir: ({ locals, request }) => request.formData().then((formData) => NameHeir(locals, formData)),
	switchWater: ({ locals, request }) => request.formData().then((formData) => SwitchWater(locals, formData))
};
