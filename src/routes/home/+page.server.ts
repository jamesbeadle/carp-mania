import type { Actions, PageServerLoad } from './$types';
import { NameHeir } from '$lib/server/commands/NameHeir';
import { SimulateElapsedTime } from '$lib/server/commands/SimulateElapsedTime';
import { SwitchWater } from '$lib/server/commands/SwitchWater';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { requireUser } from '$lib/server/gates/requireUser';
import { GetFishermanDiary } from '$lib/server/queries/GetFishermanDiary';
import { GetMyFishery } from '$lib/server/queries/GetMyFishery';
import { GetWorksInProgressCount } from '$lib/server/queries/GetWorksInProgressCount';
import { loadMyWaters } from '$lib/server/queries/loadMyWaters';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	const whileAway = await SimulateElapsedTime(locals);
	const [fishery, profile, worksInProgress, diary, waters] = await Promise.all([
		GetMyFishery(locals), loadProfile(locals), GetWorksInProgressCount(locals), GetFishermanDiary(locals), loadMyWaters(locals, user.id)
	]);
	return { profile, fishery, whileAway, diary, waters, worksInProgress, isStage: true };
};

export const actions: Actions = {
	nameHeir: ({ locals, request }) => request.formData().then((formData) => NameHeir(locals, formData)),
	switchWater: ({ locals, request }) => request.formData().then((formData) => SwitchWater(locals, formData))
};
