import type { Actions, PageServerLoad } from './$types';
import { FavouriteLake } from '$lib/server/commands/FavouriteLake';
import { UnfavouriteLake } from '$lib/server/commands/UnfavouriteLake';
import { GetLake } from '$lib/server/queries/GetLake';
import { GetMatchesAtWater, runningMatchAmong } from '$lib/server/queries/GetMatchesAtWater';
import { GetMyFavourites } from '$lib/server/queries/GetMyFavourites';
import { GetBookingDiary } from '$lib/server/queries/GetBookingDiary';
import { loadBountiesOnTheWater } from '$lib/server/queries/GetBounties';

export const load: PageServerLoad = async ({ locals, params }) => {
	const lakeId = params.lakeId;
	const [water, favouriteIds, matches, diary, bounties] = await Promise.all([
		GetLake(locals, lakeId), GetMyFavourites(locals), GetMatchesAtWater(locals, lakeId), GetBookingDiary(locals, lakeId), loadBountiesOnTheWater(locals.supabase, lakeId)
	]);
	const isFavourite = favouriteIds.includes(lakeId);
	return { water, diary, isFavourite, matches, bounties, runningMatch: runningMatchAmong(matches), loadedAt: new Date().toISOString() };
};

export const actions: Actions = {
	favourite: ({ locals, request }) => request.formData().then((formData) => FavouriteLake(locals, formData)),
	unfavourite: ({ locals, request }) => request.formData().then((formData) => UnfavouriteLake(locals, formData))
};
