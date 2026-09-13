import type { Measures, MeasureUp, TrophyRoom } from '$lib/contracts/TrophyRoom';
import type { PublicAngler } from '$lib/contracts/AnglerPublicProfile';
import { overallAnglerSkill } from '$lib/domain/anglerSkills';
import { loadProfile } from '../gates/requireMoney';
import { loadRanks } from './loadTrophyRoom';
import { skillsOf } from './skillsOf';

export async function loadMeasureUp(locals: App.Locals, viewerId: string, angler: PublicAngler, theirRoom: TrophyRoom): Promise<MeasureUp> {
	const [theirTrophies, yours] = await Promise.all([countTrophiesOf(locals, angler.id), loadYourMeasures(locals, viewerId)]);
	const theirs: Measures = {
		personalBestLb: theirRoom.ranks.bestLb,
		fishLanded: angler.experience,
		overallSkill: overallAnglerSkill(skillsOf(angler)),
		recordsHeld: theirRoom.recordsHeld.length,
		trophies: theirTrophies
	};
	return { theirName: angler.display_name, theirs, yours };
}

async function loadYourMeasures(locals: App.Locals, viewerId: string): Promise<Measures> {
	const [profile, ranks, recordsHeld, trophies] = await Promise.all([loadProfile(locals), loadRanks(locals, viewerId), countRecordsHeldBy(locals, viewerId), countTrophiesOf(locals, viewerId)]);
	return { personalBestLb: ranks.bestLb, fishLanded: profile.experience, overallSkill: overallAnglerSkill(skillsOf(profile)), recordsHeld, trophies };
}

async function countRecordsHeldBy(locals: App.Locals, anglerId: string) {
	const { data } = await locals.supabase.rpc('records_held_by', { angler: anglerId });
	return (data ?? []).length;
}

async function countTrophiesOf(locals: App.Locals, anglerId: string) {
	const { count } = await locals.supabase.from('trophies').select('id', { count: 'exact', head: true }).eq('profile_id', anglerId);
	return count ?? 0;
}
