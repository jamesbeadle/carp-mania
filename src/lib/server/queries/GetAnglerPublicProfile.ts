import { error } from '@sveltejs/kit';
import type { AnglerPublicProfile, AnglerWater, PlaceInTheLine, PublicAngler } from '$lib/contracts/AnglerPublicProfile';
import { overallAnglerSkill } from '$lib/domain/anglerSkills';
import { diaryAgeOf } from '$lib/domain/legacy/diary';
import { requireUser } from '../gates/requireUser';
import { loadLine } from './GetFishermanDiary';
import { loadCarpNames, loadCatchHistoryOf, loadFamousFishCaughtBy, loadHeaviestCatchesBy } from './loadAnglerCatches';
import { loadLakeNames } from './loadCarpHistory';
import { skillsOf } from './skillsOf';

const PersonalBestLimit = 5;
const NoSuchAngler = 'No angler by that name';
const PublicColumns = 'id, display_name, avatar_url, experience, line_selection, rig_selection, bait_selection, watercraft';
const WaterColumns = 'id, name, region, acres, reputation, day_ticket_fee';

export async function GetAnglerPublicProfile(locals: App.Locals, anglerId: string, pageNumber: number): Promise<AnglerPublicProfile> {
	const viewer = requireUser(locals);
	const [profile, waters, personalBests, recentCatches, famousFish, line] = await Promise.all([
		loadAngler(locals, anglerId),
		loadWatersRunBy(locals, anglerId),
		loadHeaviestCatchesBy(locals, anglerId, PersonalBestLimit),
		loadCatchHistoryOf(locals, { angler_id: anglerId }, pageNumber),
		loadFamousFishCaughtBy(locals, anglerId),
		loadPlaceInTheLine(locals, anglerId)
	]);
	const catches = [...personalBests, ...recentCatches.items];
	const [carpNames, lakeNames] = await Promise.all([
		loadCarpNames(locals, catches.map((caught) => caught.carp_id)),
		loadLakeNames(locals, catches.map((caught) => caught.lake_id))
	]);
	return {
		profile,
		line,
		overallSkill: overallAnglerSkill(skillsOf(profile)),
		waters,
		personalBests,
		recentCatches,
		famousFish,
		carpNames,
		lakeNames,
		isViewer: viewer.id === profile.id
	};
}

async function loadPlaceInTheLine(locals: App.Locals, anglerId: string): Promise<PlaceInTheLine | null> {
	const current = (await loadLine(locals, anglerId)).find((fisherman) => fisherman.retired_at === null);
	return current ? { generation: current.generation, age: diaryAgeOf(current, new Date()) } : null;
}

async function loadAngler(locals: App.Locals, anglerId: string): Promise<PublicAngler> {
	const { data: angler } = await locals.supabase.from('profiles').select(PublicColumns).eq('id', anglerId).maybeSingle();
	if (!angler) error(404, NoSuchAngler);
	return angler as PublicAngler;
}

async function loadWatersRunBy(locals: App.Locals, anglerId: string): Promise<AnglerWater[]> {
	const { data: waters } = await locals.supabase.from('lakes').select(WaterColumns).eq('owner_id', anglerId).eq('is_public', true).eq('is_setup_complete', true).order('created_at');
	return (waters ?? []) as AnglerWater[];
}
