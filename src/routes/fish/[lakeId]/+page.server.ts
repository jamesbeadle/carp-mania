import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { StartFishingSession } from '$lib/server/commands/StartFishingSession';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetFishingVisit } from '$lib/server/queries/GetFishingVisit';
import { GetLake } from '$lib/server/queries/GetLake';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const water = await GetLake(locals, params.lakeId);
	const profile = await loadProfile(locals);
	const visitId = url.searchParams.get('visit');
	const visit = visitId ? await GetFishingVisit(locals, params.lakeId, visitId) : null;
	return { water, profile, visit };
};

export const actions: Actions = {
	buyTicket: async ({ locals, params }) => {
		const visit = await StartFishingSession(locals, params.lakeId);
		redirect(303, `/fish/${params.lakeId}?visit=${visit.id}`);
	}
};
