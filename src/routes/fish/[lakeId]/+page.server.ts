import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { StartFishingSession } from '$lib/server/commands/StartFishingSession';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetFishingVisit } from '$lib/server/queries/GetFishingVisit';
import { GetLake } from '$lib/server/queries/GetLake';
import { GetMatchesAtWater, runningMatchAmong } from '$lib/server/queries/GetMatchesAtWater';
import { GetTheBar } from '$lib/server/queries/GetTheBar';
import { loadOwnedTackle } from '$lib/server/queries/GetTackleBox';

const VisitParam = 'visit';
const HttpStatus = { BadRequest: 400 } as const;

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const visitId = url.searchParams.get(VisitParam);
	const [water, profile, matches, visit] = await Promise.all([
		GetLake(locals, params.lakeId),
		loadProfile(locals),
		GetMatchesAtWater(locals, params.lakeId),
		visitId ? GetFishingVisit(locals, params.lakeId, visitId) : null
	]);
	const isOnTheWater = visit !== null;
	const barLoad = visit ? GetTheBar(locals, water.lake, visit.visitedAt) : null;
	const ownedLoad = visit ? loadOwnedTackle(locals, profile.id) : [];
	const [bar, owned] = await Promise.all([barLoad, ownedLoad]);
	return { water, profile, visit, bar, owned, runningMatch: runningMatchAmong(matches), isStage: isOnTheWater, isImmersive: isOnTheWater };
};

export const actions: Actions = {
	buyTicket: async ({ locals, params }) => {
		const started = await StartFishingSession(locals, params.lakeId);
		if ('refusal' in started) return fail(HttpStatus.BadRequest, { message: started.refusal });
		redirect(303, `/fish/${params.lakeId}?visit=${started.visit.id}`);
	}
};
