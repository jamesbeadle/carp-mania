import type { Actions, PageServerLoad } from './$types';
import { NameHeir } from '$lib/server/commands/NameHeir';
import { SimulateElapsedTime } from '$lib/server/commands/SimulateElapsedTime';
import { SwitchWater } from '$lib/server/commands/SwitchWater';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { requireUser } from '$lib/server/gates/requireUser';
import { GetFishermanDiary } from '$lib/server/queries/GetFishermanDiary';
import { GetHomeHub } from '$lib/server/queries/GetHomeHub';
import { GetMyFishery } from '$lib/server/queries/GetMyFishery';
import { GetMyMarketActivity } from '$lib/server/queries/GetMyMarketActivity';
import { GetMyNextMatch } from '$lib/server/queries/GetMyNextMatch';
import { GetWorldActivity, WorldActivityLimit } from '$lib/server/queries/GetWorldActivity';
import { loadMyWaters } from '$lib/server/queries/loadMyWaters';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	const whileAway = await SimulateElapsedTime(locals);
	const [fishery, profile, hub, diary, waters] = await Promise.all([
		GetMyFishery(locals), loadProfile(locals), GetHomeHub(locals), GetFishermanDiary(locals), loadMyWaters(locals, user.id)
	]);
	const behindTheSheets = {
		worldFeed: GetWorldActivity(locals, { limit: WorldActivityLimit.HomeHub }),
		marketWatch: GetMyMarketActivity(locals),
		nextMatch: GetMyNextMatch(locals)
	};
	return { profile, fishery, whileAway, diary, waters, ...behindTheSheets, loadedAt: new Date().toISOString(), isStage: true, ...hub };
};

export const actions: Actions = {
	nameHeir: ({ locals, request }) => request.formData().then((formData) => NameHeir(locals, formData)),
	switchWater: ({ locals, request }) => request.formData().then((formData) => SwitchWater(locals, formData))
};
