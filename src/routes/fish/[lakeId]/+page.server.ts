import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { BuyTicket, SitTheNextSession } from '$lib/server/commands/BuyTicket';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetFishingVisit } from '$lib/server/queries/GetFishingVisit';
import { GetLake } from '$lib/server/queries/GetLake';
import { GetMatchesAtWater, runningMatchAmong } from '$lib/server/queries/GetMatchesAtWater';
import { GetTheBar } from '$lib/server/queries/GetTheBar';
import { GetTicketBook } from '$lib/server/queries/GetTicketBook';
import { loadOwnedTackle } from '$lib/server/queries/GetTackleBox';

const VisitParam = 'visit';
const ProductField = 'productId';
const HttpStatus = { BadRequest: 400 } as const;

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const visitId = url.searchParams.get(VisitParam);
	const [water, profile, matches, visit, book] = await Promise.all([
		GetLake(locals, params.lakeId),
		loadProfile(locals),
		GetMatchesAtWater(locals, params.lakeId),
		visitId ? GetFishingVisit(locals, params.lakeId, visitId) : null,
		GetTicketBook(locals, params.lakeId)
	]);
	const isOnTheWater = visit !== null;
	const barLoad = visit ? GetTheBar(locals, water.lake, visit.visitedAt) : null;
	const ownedLoad = visit ? loadOwnedTackle(locals, profile.id) : [];
	const [bar, owned] = await Promise.all([barLoad, ownedLoad]);
	return { water, profile, visit, bar, owned, book, runningMatch: runningMatchAmong(matches), isStage: isOnTheWater, isImmersive: isOnTheWater };
};

export const actions: Actions = {
	buyTicket: async ({ locals, params, request }) => {
		const formData = await request.formData();
		const started = await BuyTicket(locals, params.lakeId, String(formData.get(ProductField) ?? ''));
		if ('refusal' in started) return fail(HttpStatus.BadRequest, { message: started.refusal });
		redirect(303, `/fish/${params.lakeId}?${VisitParam}=${started.visit.id}`);
	},
	nextSession: async ({ locals, params, request }) => {
		const formData = await request.formData();
		const started = await SitTheNextSession(locals, params.lakeId, String(formData.get(VisitParam) ?? ''));
		if ('refusal' in started) return fail(HttpStatus.BadRequest, { message: started.refusal });
		redirect(303, `/fish/${params.lakeId}?${VisitParam}=${started.visit.id}`);
	}
};
