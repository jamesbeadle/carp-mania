import { fail, redirect } from '@sveltejs/kit';
import { bookingFeeFor, whyMatchCannotBeBooked, type MatchOrder } from '$lib/domain/matches/matchRules';
import { readMatchOrder } from '../gates/readMatchOrder';
import { loadProfile, moneyShortfall } from '../gates/requireMoney';
import { requireUser } from '../gates/requireUser';
import { GetLake, type LakeForAnglers } from '../queries/GetLake';

const GatesShut = 'Open the gates before hosting a match on your own water';
const NotOpen = 'That water is not open to anglers';

export async function HostMatch(locals: App.Locals, lakeId: string, formData: FormData) {
	const user = requireUser(locals);
	const water = await GetLake(locals, lakeId);
	const isOwnWater = water.lake.owner_id === user.id;
	if (!water.lake.is_public || !water.lake.is_setup_complete) return fail(400, { message: isOwnWater ? GatesShut : NotOpen });
	const order = readMatchOrder(formData);
	if (order.failure) return order.failure;
	const refusal = whyMatchCannotBeBooked(order.value, water.swims.length, await countOpenMatchesHostedBy(locals, user.id));
	if (refusal) return fail(400, { message: refusal });
	const shortfall = moneyShortfall(await loadProfile(locals), costOfHosting(water, order.value, isOwnWater));
	if (shortfall) return shortfall;

	const { data: matchId, error } = await locals.supabase.rpc('book_match', bookingArguments(lakeId, order.value));
	if (error) return fail(400, { message: error.message });
	redirect(303, `/matches/${matchId}`);
}

export async function countOpenMatchesHostedBy(locals: App.Locals, hostId: string) {
	const { count } = await locals.supabase.from('matches').select('id', { count: 'exact', head: true }).eq('host_id', hostId).eq('status', 'open');
	return count ?? 0;
}

function costOfHosting(water: LakeForAnglers, order: MatchOrder, isOwnWater: boolean) {
	return bookingFeeFor(Number(water.lake.day_ticket_fee), order.lastsHours, isOwnWater) + order.hostStake;
}

function bookingArguments(lakeId: string, order: MatchOrder) {
	return {
		lake: lakeId,
		match_title: order.title,
		starts_in_hours: order.startsInHours,
		lasts_hours: order.lastsHours,
		entry: order.entryFee,
		stake: order.hostStake,
		catches_share: order.mostCatchesShare
	};
}
