import type { Actions, PageServerLoad } from './$types';
import { BookAPeg } from '$lib/server/commands/BookAPeg';
import { BuySyndicatePlace } from '$lib/server/commands/BuySyndicatePlace';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetBookingDiary } from '$lib/server/queries/GetBookingDiary';
import { GetLake } from '$lib/server/queries/GetLake';

export const load: PageServerLoad = async ({ locals, params }) => {
	const [water, diary, profile] = await Promise.all([GetLake(locals, params.lakeId), GetBookingDiary(locals, params.lakeId), loadProfile(locals)]);
	return { lake: water.lake, diary, profile };
};

export const actions: Actions = {
	book: async ({ locals, params, request }) => BookAPeg(locals, params.lakeId, await request.formData()),
	joinSyndicate: async ({ locals, params }) => BuySyndicatePlace(locals, params.lakeId)
};
