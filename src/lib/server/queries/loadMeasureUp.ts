import type { Measures, MeasureUp, TrophyRoom } from '$lib/contracts/TrophyRoom';
import type { PublicAngler } from '$lib/contracts/AnglerPublicProfile';
import { loadProfile } from '../gates/requireMoney';
import { loadRanks } from './loadTrophyRoom';
import { loadRatingOf } from './loadAnglerRating';

export async function loadMeasureUp(locals: App.Locals, viewerId: string, angler: PublicAngler, theirRoom: TrophyRoom): Promise<MeasureUp> {
	const [theirTrophies, theirRating, yours] = await Promise.all([countTrophiesOf(locals, angler.id), loadRatingOf(locals, angler.id), loadYourMeasures(locals, viewerId)]);
	const theirs: Measures = {
		personalBestLb: theirRoom.ranks.bestLb,
		fishLanded: angler.experience,
		rating: theirRating,
		recordsHeld: theirRoom.recordsHeld.length,
		trophies: theirTrophies
	};
	return { theirName: angler.display_name, theirs, yours };
}

async function loadYourMeasures(locals: App.Locals, viewerId: string): Promise<Measures> {
	const [profile, ranks, recordsHeld, trophies, rating] = await Promise.all([loadProfile(locals), loadRanks(locals, viewerId), countRecordsHeldBy(locals, viewerId), countTrophiesOf(locals, viewerId), loadRatingOf(locals, viewerId)]);
	return { personalBestLb: ranks.bestLb, fishLanded: profile.experience, rating, recordsHeld, trophies };
}

async function countRecordsHeldBy(locals: App.Locals, anglerId: string) {
	const { data } = await locals.supabase.rpc('records_held_by', { angler: anglerId });
	return (data ?? []).length;
}

async function countTrophiesOf(locals: App.Locals, anglerId: string) {
	const { count } = await locals.supabase.from('trophies').select('id', { count: 'exact', head: true }).eq('profile_id', anglerId);
	return count ?? 0;
}
