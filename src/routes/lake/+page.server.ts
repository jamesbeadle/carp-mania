import type { Actions, PageServerLoad } from './$types';
import { BuyCarpFromFishFarm } from '$lib/server/commands/BuyCarpFromFishFarm';
import { FeedLake } from '$lib/server/commands/FeedLake';
import { DismissBailiff, HireBailiff } from '$lib/server/commands/ManageBailiff';
import { RenameLake } from '$lib/server/commands/RenameLake';
import { SellCarpToDealer } from '$lib/server/commands/SellCarpToDealer';
import { SetDayTicketFee } from '$lib/server/commands/SetDayTicketFee';
import { SimulateElapsedTime } from '$lib/server/commands/SimulateElapsedTime';
import { StockPike, StockPikeFood } from '$lib/server/commands/StockPike';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetFishFarmStock } from '$lib/server/queries/GetFishFarmStock';
import { GetMyFishery } from '$lib/server/queries/GetMyFishery';

export const load: PageServerLoad = async ({ locals }) => {
	const whileAway = await SimulateElapsedTime(locals);
	const fishery = await GetMyFishery(locals);
	const profile = await loadProfile(locals);
	const farmStock = await GetFishFarmStock(locals, profile.home_region ?? fishery.lake.region);
	return { fishery, profile, whileAway, farmStock };
};

export const actions: Actions = {
	feed: ({ locals, request }) => request.formData().then((formData) => FeedLake(locals, formData)),
	buyFromFarm: ({ locals, request }) => request.formData().then((formData) => BuyCarpFromFishFarm(locals, formData)),
	sellToDealer: ({ locals, request }) => request.formData().then((formData) => SellCarpToDealer(locals, formData)),
	stockPike: ({ locals, request }) => request.formData().then((formData) => StockPike(locals, formData)),
	stockPikeFood: ({ locals, request }) => request.formData().then((formData) => StockPikeFood(locals, formData)),
	hireBailiff: ({ locals }) => HireBailiff(locals),
	dismissBailiff: ({ locals }) => DismissBailiff(locals),
	setFee: ({ locals, request }) => request.formData().then((formData) => SetDayTicketFee(locals, formData)),
	rename: ({ locals, request }) => request.formData().then((formData) => RenameLake(locals, formData))
};
