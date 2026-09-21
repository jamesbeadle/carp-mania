import type { Actions, PageServerLoad } from './$types';
import { FavouriteLake } from '$lib/server/commands/FavouriteLake';
import { UnfavouriteLake } from '$lib/server/commands/UnfavouriteLake';
import { GetMyFavourites } from '$lib/server/queries/GetMyFavourites';
import { GetMyLakeId } from '$lib/server/queries/GetMyLakeId';
import { GetWorldActivity, WorldActivityLimit } from '$lib/server/queries/GetWorldActivity';
import { GetWorldPins } from '$lib/server/queries/GetWorldPins';
import { GetGreatestCatches } from '$lib/server/queries/GetGreatestCatches';

export const load: PageServerLoad = async ({ locals }) => {
	const [pins, favouriteIds, feed, myLakeId, greatest] = await Promise.all([
		GetWorldPins(locals),
		GetMyFavourites(locals),
		GetWorldActivity(locals, { limit: WorldActivityLimit.LiveFeed }),
		GetMyLakeId(locals),
		GetGreatestCatches(locals)
	]);
	return { pins, favouriteIds, feed, myLakeId, greatest };
};

export const actions: Actions = {
	favourite: ({ locals, request }) => request.formData().then((formData) => FavouriteLake(locals, formData)),
	unfavourite: ({ locals, request }) => request.formData().then((formData) => UnfavouriteLake(locals, formData))
};
