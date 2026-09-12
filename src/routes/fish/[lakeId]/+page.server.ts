import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { StartFishingSession } from '$lib/server/commands/StartFishingSession';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetFishingVisit } from '$lib/server/queries/GetFishingVisit';
import { GetLake } from '$lib/server/queries/GetLake';
import { GetMatchesAtWater, runningMatchAmong } from '$lib/server/queries/GetMatchesAtWater';
import { GetTheBar } from '$lib/server/queries/GetTheBar';

const VisitParam = 'visit';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const visitId = url.searchParams.get(VisitParam);
	const [water, profile, matches, visit] = await Promise.all([
		GetLake(locals, params.lakeId),
		loadProfile(locals),
		GetMatchesAtWater(locals, params.lakeId),
		visitId ? GetFishingVisit(locals, params.lakeId, visitId) : null
	]);
	const isOnTheWater = visit !== null;
	const bar = isOnTheWater ? await GetTheBar(locals, water.lake) : null;
	return { water, profile, visit, bar, runningMatch: runningMatchAmong(matches), isStage: isOnTheWater, isImmersive: isOnTheWater };
};

export const actions: Actions = {
	buyTicket: async ({ locals, params }) => {
		const visit = await StartFishingSession(locals, params.lakeId);
		redirect(303, `/fish/${params.lakeId}?visit=${visit.id}`);
	}
};
