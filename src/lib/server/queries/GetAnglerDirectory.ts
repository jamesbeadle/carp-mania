import type { AnglerDirectoryEntry, AnglerSkills, NamedWater } from '$lib/contracts/AnglerDirectory';
import { overallAnglerSkill } from '$lib/domain/anglerSkills';
import { requireUser } from '../gates/requireUser';
import { skillsOf } from './skillsOf';

const DirectorySize = 100;
const AnglerColumns = 'id, display_name, avatar_url, experience, line_selection, rig_selection, bait_selection, watercraft, catches(weight_lb)';
const TheirCatches = 'catches';

type AnglerRow = AnglerSkills & {
	id: string;
	display_name: string;
	avatar_url: string | null;
	experience: number;
	catches: { weight_lb: number }[];
};
type WaterRow = NamedWater & { owner_id: string };
type AnglerWithoutWater = Omit<AnglerDirectoryEntry, 'water'>;

export async function GetAnglerDirectory(locals: App.Locals): Promise<AnglerDirectoryEntry[]> {
	requireUser(locals);
	const anglers = await loadAnglersWithTheirBest(locals);
	const topAnglers = anglers.map(summarise).sort(bestSkillFirst).slice(0, DirectorySize);
	const waters = await loadWatersRunBy(locals, topAnglers.map((angler) => angler.id));
	return topAnglers.map((angler) => ({ ...angler, water: waters[angler.id] ?? null }));
}

async function loadAnglersWithTheirBest(locals: App.Locals): Promise<AnglerRow[]> {
	const { data: anglers } = await locals.supabase
		.from('profiles')
		.select(AnglerColumns)
		.order('weight_lb', { ascending: false, referencedTable: TheirCatches })
		.limit(1, { referencedTable: TheirCatches });
	return (anglers ?? []) as AnglerRow[];
}

function summarise(row: AnglerRow): AnglerWithoutWater {
	const skills = skillsOf(row);
	return {
		id: row.id,
		displayName: row.display_name,
		avatarUrl: row.avatar_url,
		skills,
		overallSkill: overallAnglerSkill(skills),
		personalBestLb: Number(row.catches[0]?.weight_lb ?? 0),
		totalCatches: row.experience
	};
}

function bestSkillFirst(first: AnglerWithoutWater, second: AnglerWithoutWater) {
	return second.overallSkill - first.overallSkill;
}

async function loadWatersRunBy(locals: App.Locals, anglerIds: string[]): Promise<Record<string, NamedWater>> {
	if (anglerIds.length === 0) return {};
	const { data: waters } = await locals.supabase.from('lakes').select('id, name, owner_id').in('owner_id', anglerIds);
	return Object.fromEntries(((waters ?? []) as WaterRow[]).map(({ owner_id, ...water }) => [owner_id, water]));
}
