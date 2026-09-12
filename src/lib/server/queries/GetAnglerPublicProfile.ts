import { error } from '@sveltejs/kit';
import type { AnglerPublicProfile, AnglerWater, PublicAngler } from '$lib/contracts/AnglerPublicProfile';
import { overallAnglerSkill } from '$lib/domain/anglerSkills';
import { requireUser } from '../gates/requireUser';
import { loadCarpNames, loadFamousFishCaughtBy, loadHeaviestCatchesBy, loadLatestCatchesBy } from './loadAnglerCatches';
import { loadLakeNames } from './loadCarpHistory';
import { skillsOf } from './skillsOf';

const PersonalBestLimit = 5;
const RecentCatchLimit = 20;
const NoSuchAngler = 'No angler by that name';
const PublicColumns = 'id, display_name, avatar_url, experience, line_selection, rig_selection, bait_selection, watercraft';
const WaterColumns = 'id, name, region, acres, reputation, day_ticket_fee';

export async function GetAnglerPublicProfile(locals: App.Locals, anglerId: string): Promise<AnglerPublicProfile> {
	const viewer = requireUser(locals);
	const profile = await loadAngler(locals, anglerId);
	const [water, personalBests, recentCatches, famousFish] = await Promise.all([
		loadWaterRunBy(locals, anglerId),
		loadHeaviestCatchesBy(locals, anglerId, PersonalBestLimit),
		loadLatestCatchesBy(locals, anglerId, RecentCatchLimit),
		loadFamousFishCaughtBy(locals, anglerId)
	]);
	const catches = [...personalBests, ...recentCatches];
	const [carpNames, lakeNames] = await Promise.all([
		loadCarpNames(locals, catches.map((caught) => caught.carp_id)),
		loadLakeNames(locals, catches.map((caught) => caught.lake_id))
	]);
	return {
		profile,
		overallSkill: overallAnglerSkill(skillsOf(profile)),
		water,
		personalBests,
		recentCatches,
		famousFish,
		carpNames,
		lakeNames,
		isViewer: viewer.id === profile.id
	};
}

async function loadAngler(locals: App.Locals, anglerId: string): Promise<PublicAngler> {
	const { data: angler } = await locals.supabase.from('profiles').select(PublicColumns).eq('id', anglerId).maybeSingle();
	if (!angler) error(404, NoSuchAngler);
	return angler as PublicAngler;
}

async function loadWaterRunBy(locals: App.Locals, anglerId: string): Promise<AnglerWater | null> {
	const { data: water } = await locals.supabase.from('lakes').select(WaterColumns).eq('owner_id', anglerId).maybeSingle();
	return water as AnglerWater | null;
}
