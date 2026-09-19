import type { Actions, PageServerLoad } from './$types';
import { FavouriteLake } from '$lib/server/commands/FavouriteLake';
import { UnfavouriteLake } from '$lib/server/commands/UnfavouriteLake';
import { GetLake } from '$lib/server/queries/GetLake';
import { GetMatchesAtWater, runningMatchAmong } from '$lib/server/queries/GetMatchesAtWater';
import { GetMyFavourites } from '$lib/server/queries/GetMyFavourites';
import { GetBookingDiary } from '$lib/server/queries/GetBookingDiary';

export const load: PageServerLoad = async ({ locals, params }) => {
	const lakeId = params.lakeId;
	const [water, favouriteIds, matches, diary] = await Promise.all([GetLake(locals, lakeId), GetMyFavourites(locals), GetMatchesAtWater(locals, lakeId), GetBookingDiary(locals, lakeId)]);
	return { water, diary, isFavourite: favouriteIds.includes(params.lakeId), matches, runningMatch: runningMatchAmong(matches), loadedAt: new Date().toISOString() };
};

export const actions: Actions = {
	favourite: ({ locals, request }) => request.formData().then((formData) => FavouriteLake(locals, formData)),
	unfavourite: ({ locals, request }) => request.formData().then((formData) => UnfavouriteLake(locals, formData))
};
