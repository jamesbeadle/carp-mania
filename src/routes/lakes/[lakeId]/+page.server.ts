import type { Actions, PageServerLoad } from './$types';
import { FavouriteLake } from '$lib/server/commands/FavouriteLake';
import { UnfavouriteLake } from '$lib/server/commands/UnfavouriteLake';
import { GetLake } from '$lib/server/queries/GetLake';
import { GetMyFavourites } from '$lib/server/queries/GetMyFavourites';

export const load: PageServerLoad = async ({ locals, params }) => {
	const [water, favouriteIds] = await Promise.all([GetLake(locals, params.lakeId), GetMyFavourites(locals)]);
	return { water, isFavourite: favouriteIds.includes(params.lakeId) };
};

export const actions: Actions = {
	favourite: ({ locals, request }) => request.formData().then((formData) => FavouriteLake(locals, formData)),
	unfavourite: ({ locals, request }) => request.formData().then((formData) => UnfavouriteLake(locals, formData))
};
