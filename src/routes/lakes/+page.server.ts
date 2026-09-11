import type { Actions, PageServerLoad } from './$types';
import { FavouriteLake } from '$lib/server/commands/FavouriteLake';
import { UnfavouriteLake } from '$lib/server/commands/UnfavouriteLake';
import { GetMyFavourites } from '$lib/server/queries/GetMyFavourites';
import { GetPublicLakes } from '$lib/server/queries/GetPublicLakes';

export const load: PageServerLoad = async ({ locals }) => {
	const [lakes, favouriteIds] = await Promise.all([GetPublicLakes(locals), GetMyFavourites(locals)]);
	return { lakes, favouriteIds };
};

export const actions: Actions = {
	favourite: ({ locals, request }) => request.formData().then((formData) => FavouriteLake(locals, formData)),
	unfavourite: ({ locals, request }) => request.formData().then((formData) => UnfavouriteLake(locals, formData))
};
