import type { Actions, PageServerLoad } from './$types';
import { BuyFarmPack } from '$lib/server/commands/BuyFarmPack';
import { GetFarms } from '$lib/server/queries/GetFarms';

export const load: PageServerLoad = async ({ locals }) => {
	return { shelves: await GetFarms(locals) };
};

export const actions: Actions = {
	buy: async ({ locals, request }) => BuyFarmPack(locals, await request.formData())
};
