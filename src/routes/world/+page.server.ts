import type { Actions, PageServerLoad } from './$types';
import { FavouriteLake } from '$lib/server/commands/FavouriteLake';
import { UnfavouriteLake } from '$lib/server/commands/UnfavouriteLake';
import { GetMyFavourites } from '$lib/server/queries/GetMyFavourites';
import { GetMyLakeId } from '$lib/server/queries/GetMyLakeId';
import { GetWorldActivity, WorldActivityLimit } from '$lib/server/queries/GetWorldActivity';
import { GetWorldPins } from '$lib/server/queries/GetWorldPins';

export const load: PageServerLoad = async ({ locals }) => {
	const [pins, favouriteIds, feed, myLakeId] = await Promise.all([
		GetWorldPins(locals),
		GetMyFavourites(locals),
		GetWorldActivity(locals, WorldActivityLimit.LiveFeed),
		GetMyLakeId(locals)
	]);
	return { pins, favouriteIds, feed, myLakeId };
};

export const actions: Actions = {
	favourite: ({ locals, request }) => request.formData().then((formData) => FavouriteLake(locals, formData)),
	unfavourite: ({ locals, request }) => request.formData().then((formData) => UnfavouriteLake(locals, formData))
};
