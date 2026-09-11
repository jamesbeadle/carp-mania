import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { PayDayTicket } from '$lib/server/commands/PayDayTicket';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetLake } from '$lib/server/queries/GetLake';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const water = await GetLake(locals, params.lakeId);
	const profile = await loadProfile(locals);
	const visitId = url.searchParams.get('visit');
	return { water, profile, visitId };
};

export const actions: Actions = {
	buyTicket: async ({ locals, params }) => {
		const visitId = await PayDayTicket(locals, params.lakeId);
		redirect(303, `/fish/${params.lakeId}?visit=${visitId}`);
	}
};
