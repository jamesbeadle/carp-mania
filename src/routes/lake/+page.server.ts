import type { Actions, PageServerLoad } from './$types';
import { CancelGroundworks } from '$lib/server/commands/CancelGroundworks';
import { CancelListing } from '$lib/server/commands/CancelListing';
import { FeedLake } from '$lib/server/commands/FeedLake';
import { ListFishForSale } from '$lib/server/commands/ListFishForSale';
import { HireBailiff } from '$lib/server/commands/HireBailiff';
import { SackBailiff } from '$lib/server/commands/SackBailiff';
import { MoveFishToMyWater } from '$lib/server/commands/MoveFishToMyWater';
import { RenameLake } from '$lib/server/commands/RenameLake';
import { SellFishToDealer } from '$lib/server/commands/SellFishToDealer';
import { SellShoalFish } from '$lib/server/commands/SellShoalFish';
import { StockCoarseFish } from '$lib/server/commands/StockCoarseFish';
import { NetTheSilvers } from '$lib/server/commands/NetTheSilvers';
import { PostBounty } from '$lib/server/commands/PostBounty';
import { TurnOnAdvanceBooking } from '$lib/server/commands/TurnOnAdvanceBooking';
import { SellSyndicatePlaces } from '$lib/server/commands/SellSyndicatePlaces';
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
import { GetBailiffs } from '$lib/server/queries/GetBailiffs';
import { loadBountiesOnTheWater } from '$lib/server/queries/GetBounties';
import { loadSpeciesOf } from '$lib/server/queries/GetLakeSpecies';
import { loadMyWaters } from '$lib/server/queries/loadMyWaters';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	const whileAway = await SimulateElapsedTime(locals);
	const [fishery, profile, groundworks, marketActivity, waters] = await Promise.all([
		GetMyFishery(locals), loadProfile(locals), GetMyGroundworks(locals), GetMyMarketActivity(locals), loadMyWaters(locals, user.id)
	]);
	const lakeId = fishery.lake.id;
	const [book, bailiffs, species, bounties] = await Promise.all([GetTicketBook(locals, lakeId), GetBailiffs(locals), loadSpeciesOf(locals, lakeId), loadBountiesOnTheWater(locals.supabase, lakeId)]);
	return { fishery, profile, whileAway, groundworks, marketActivity, waters, book, bailiffs, species, bounties, loadedAt: new Date().toISOString() };
};

export const actions: Actions = {
	feed: ({ locals, request }) => request.formData().then((formData) => FeedLake(locals, formData)),
	sellToDealer: ({ locals, request }) => request.formData().then((formData) => SellFishToDealer(locals, formData)),
	sellShoalFish: ({ locals, request }) => request.formData().then((formData) => SellShoalFish(locals, formData)),
	stockCoarseFish: ({ locals, request }) => request.formData().then((formData) => StockCoarseFish(locals, formData)),
	netTheSilvers: ({ locals }) => NetTheSilvers(locals),
	turnOnBooking: ({ locals, request }) => request.formData().then((formData) => TurnOnAdvanceBooking(locals, formData)),
	sellSyndicate: ({ locals, request }) => request.formData().then((formData) => SellSyndicatePlaces(locals, formData)),
	postBounty: ({ locals, request }) => request.formData().then((formData) => PostBounty(locals, formData)),
	stockPike: ({ locals, request }) => request.formData().then((formData) => StockPike(locals, formData)),
	stockPikeFood: ({ locals, request }) => request.formData().then((formData) => StockPikeFood(locals, formData)),
	hireBailiff: ({ locals, request }) => request.formData().then((formData) => HireBailiff(locals, formData)),
	sackBailiff: ({ locals, request }) => request.formData().then((formData) => SackBailiff(locals, formData)),
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
