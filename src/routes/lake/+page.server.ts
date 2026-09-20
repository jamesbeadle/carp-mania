import type { Actions, PageServerLoad } from './$types';
import { CancelGroundworks } from '$lib/server/commands/CancelGroundworks';
import { CancelListing } from '$lib/server/commands/CancelListing';
import { FeedLake } from '$lib/server/commands/FeedLake';
import { ListFishForSale } from '$lib/server/commands/ListFishForSale';
import { DismissBailiff, HireBailiff } from '$lib/server/commands/ManageBailiff';
import { MoveFishToMyWater } from '$lib/server/commands/MoveFishToMyWater';
import { RenameLake } from '$lib/server/commands/RenameLake';
import { SellFishToDealer } from '$lib/server/commands/SellFishToDealer';
import { SellShoalFish } from '$lib/server/commands/SellShoalFish';
import { AddTicketProduct } from '$lib/server/commands/AddTicketProduct';
import { RemoveTicketProduct, SetBarbedRule } from '$lib/server/commands/RemoveTicketProduct';
import { SimulateElapsedTime } from '$lib/server/commands/SimulateElapsedTime';
import { StockPike, StockPikeFood } from '$lib/server/commands/StockPike';
import { SwitchWater } from '$lib/server/commands/SwitchWater';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { requireUser } from '$lib/server/gates/requireUser';
import { GetMyFishery } from '$lib/server/queries/GetMyFishery';
import { GetMyGroundworks } from '$lib/server/queries/GetMyGroundworks';
import { GetMyMarketActivity } from '$lib/server/queries/GetMyMarketActivity';
import { GetTicketBook } from '$lib/server/queries/GetTicketBook';
import { loadMyWaters } from '$lib/server/queries/loadMyWaters';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	const whileAway = await SimulateElapsedTime(locals);
	const [fishery, profile, groundworks, marketActivity, waters] = await Promise.all([
		GetMyFishery(locals), loadProfile(locals), GetMyGroundworks(locals), GetMyMarketActivity(locals), loadMyWaters(locals, user.id)
	]);
	const book = await GetTicketBook(locals, fishery.lake.id);
	return { fishery, profile, whileAway, groundworks, marketActivity, waters, book, loadedAt: new Date().toISOString() };
};

export const actions: Actions = {
	feed: ({ locals, request }) => request.formData().then((formData) => FeedLake(locals, formData)),
	sellToDealer: ({ locals, request }) => request.formData().then((formData) => SellFishToDealer(locals, formData)),
	sellShoalFish: ({ locals, request }) => request.formData().then((formData) => SellShoalFish(locals, formData)),
	stockPike: ({ locals, request }) => request.formData().then((formData) => StockPike(locals, formData)),
	stockPikeFood: ({ locals, request }) => request.formData().then((formData) => StockPikeFood(locals, formData)),
	hireBailiff: ({ locals }) => HireBailiff(locals),
	dismissBailiff: ({ locals }) => DismissBailiff(locals),
	addTicket: ({ locals, request }) => request.formData().then((formData) => AddTicketProduct(locals, formData)),
	removeTicket: ({ locals, request }) => request.formData().then((formData) => RemoveTicketProduct(locals, formData)),
	setBarbedRule: ({ locals, request }) => request.formData().then((formData) => SetBarbedRule(locals, formData)),
	rename: ({ locals, request }) => request.formData().then((formData) => RenameLake(locals, formData)),
	cancelWorks: ({ locals, request }) => request.formData().then((formData) => CancelGroundworks(locals, formData)),
	listForSale: ({ locals, request }) => request.formData().then((formData) => ListFishForSale(locals, formData)),
	moveToMyWater: ({ locals, request }) => request.formData().then((formData) => MoveFishToMyWater(locals, formData)),
	cancelListing: ({ locals, request }) => request.formData().then((formData) => CancelListing(locals, formData)),
	switchWater: ({ locals, request }) => request.formData().then((formData) => SwitchWater(locals, formData))
};
