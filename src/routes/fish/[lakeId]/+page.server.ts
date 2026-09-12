import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { StartFishingSession } from '$lib/server/commands/StartFishingSession';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetFishingVisit } from '$lib/server/queries/GetFishingVisit';
import { GetLake } from '$lib/server/queries/GetLake';
import { GetMatchesAtWater, runningMatchAmong } from '$lib/server/queries/GetMatchesAtWater';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const [water, profile, matches] = await Promise.all([GetLake(locals, params.lakeId), loadProfile(locals), GetMatchesAtWater(locals, params.lakeId)]);
	const visitId = url.searchParams.get('visit');
	const visit = visitId ? await GetFishingVisit(locals, params.lakeId, visitId) : null;
	const isOnTheWater = visit !== null;
	return { water, profile, visit, runningMatch: runningMatchAmong(matches), isStage: isOnTheWater, isImmersive: isOnTheWater };
};

export const actions: Actions = {
	buyTicket: async ({ locals, params }) => {
		const visit = await StartFishingSession(locals, params.lakeId);
		redirect(303, `/fish/${params.lakeId}?visit=${visit.id}`);
	}
};
