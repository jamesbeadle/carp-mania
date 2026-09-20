import type { Actions, PageServerLoad } from './$types';
import { BuyTackle } from '$lib/server/commands/BuyTackle';
import { GetTackleShelves } from '$lib/server/queries/GetTackleShelves';

export const load: PageServerLoad = async ({ locals }) => {
	return { shelves: await GetTackleShelves(locals) };
};

export const actions: Actions = {
	buy: async ({ locals, request }) => BuyTackle(locals, await request.formData())
};
