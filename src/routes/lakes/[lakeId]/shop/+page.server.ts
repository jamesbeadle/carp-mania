import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { BuyTackle } from '$lib/server/commands/BuyTackle';
import { GetLake } from '$lib/server/queries/GetLake';
import { GetTackleShelves } from '$lib/server/queries/GetTackleShelves';

const TackleShop = 'tackle_shop';

export const load: PageServerLoad = async ({ locals, params }) => {
	const water = await GetLake(locals, params.lakeId);
	if (!water.lake.layout.facilities.includes(TackleShop)) error(404, 'This water has no tackle shop');
	return { lake: water.lake, shelves: await GetTackleShelves(locals, water.lake.shop_tier) };
};

export const actions: Actions = {
	buy: async ({ locals, request, params }) => {
		const water = await GetLake(locals, params.lakeId);
		return BuyTackle(locals, await request.formData(), water.lake.shop_tier);
	}
};
