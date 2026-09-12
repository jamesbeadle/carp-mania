import type { AnglerDirectory, AnglerDirectoryEntry, AnglerSkills, NamedWater } from '$lib/contracts/AnglerDirectory';
import { AnglerListing, type AnglerFilters, type AnglerSort } from '$lib/domain/lists/anglerFilters';
import { listPageOf, rangeOf } from '$lib/domain/lists/paging';
import { requireUser } from '../gates/requireUser';
import { skillsOf } from './skillsOf';

type SummaryRow = AnglerSkills & {
	id: string;
	display_name: string;
	avatar_url: string | null;
	experience: number;
	overall_skill: number;
	personal_best_lb: number;
};
type WaterRow = NamedWater & { owner_id: string };
type AnglerWithoutWater = Omit<AnglerDirectoryEntry, 'water'>;

const SortOrders: Record<AnglerSort, string> = { skill: 'overall_skill', best: 'personal_best_lb', landed: 'experience' };

export async function GetAnglerDirectory(locals: App.Locals, filters: AnglerFilters): Promise<AnglerDirectory> {
	requireUser(locals);
	const page = { number: filters.page, size: AnglerListing.PageSize };
	const { from, to } = rangeOf(page);
	let query = locals.supabase.from('angler_summaries').select('*', { count: 'exact' });
	if (filters.region) query = query.eq('home_region', filters.region);
	if (filters.search) query = query.ilike('display_name', `%${filters.search}%`);
	const { data, count } = await query.order(SortOrders[filters.sort], { ascending: false }).order('display_name').range(from, to);
	const anglers = ((data ?? []) as SummaryRow[]).map(summarise);
	const waters = await loadWatersRunBy(locals, anglers.map((angler) => angler.id));
	const entries = anglers.map((angler) => ({ ...angler, water: waters[angler.id] ?? null }));
	return { page: listPageOf(entries, count ?? 0, page), filters };
}

function summarise(row: SummaryRow): AnglerWithoutWater {
	return {
		id: row.id,
		displayName: row.display_name,
		avatarUrl: row.avatar_url,
		skills: skillsOf(row),
		overallSkill: Number(row.overall_skill),
		personalBestLb: Number(row.personal_best_lb),
		totalCatches: row.experience
	};
}

async function loadWatersRunBy(locals: App.Locals, anglerIds: string[]): Promise<Record<string, NamedWater>> {
	if (anglerIds.length === 0) return {};
	const { data: waters } = await locals.supabase.from('lakes').select('id, name, owner_id').in('owner_id', anglerIds);
	return Object.fromEntries(((waters ?? []) as WaterRow[]).map(({ owner_id, ...water }) => [owner_id, water]));
}
