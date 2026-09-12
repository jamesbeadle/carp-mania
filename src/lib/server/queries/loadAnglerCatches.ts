import type { FamousFish } from '$lib/contracts/AnglerPublicProfile';
import { listPageOf, rangeOf, type ListPage } from '$lib/domain/lists/paging';
import type { CarpStrain, Catch } from '$lib/domain/types';
import { loadMemorialNames } from './loadMemorialNames';

const FamousFromFame = 20;
const PrivateWater = 'A private water';
const CatchHistoryPageSize = 20;

export type CaughtBy = { angler_id: string } | { fisherman_id: string };
type FamousFishRow = { id: string; name: string; strain: CarpStrain; weight_lb: number; fame: number; lake_id: string; lake_name: string | null };
type NamedRow = { id: string; name: string };

export async function loadHeaviestCatchesBy(locals: App.Locals, anglerId: string, limit: number): Promise<Catch[]> {
	const { data: catches } = await locals.supabase.from('catches').select('*').eq('angler_id', anglerId).order('weight_lb', { ascending: false }).limit(limit);
	return (catches ?? []) as Catch[];
}

export async function loadCatchHistoryOf(locals: App.Locals, caughtBy: CaughtBy, pageNumber: number): Promise<ListPage<Catch>> {
	const page = { number: pageNumber, size: CatchHistoryPageSize };
	const { from, to } = rangeOf(page);
	const { data, count } = await locals.supabase.from('catches').select('*', { count: 'exact' }).match(caughtBy).order('caught_at', { ascending: false }).order('id').range(from, to);
	return listPageOf((data ?? []) as Catch[], count ?? 0, page);
}

export async function loadFamousFishCaughtBy(locals: App.Locals, anglerId: string): Promise<FamousFish[]> {
	const { data: famousFish } = await locals.supabase.rpc('famous_fish_caught_by', { angler: anglerId, fame_from: FamousFromFame });
	return ((famousFish ?? []) as FamousFishRow[]).map(famousFishFrom);
}

function famousFishFrom(fish: FamousFishRow): FamousFish {
	return { id: fish.id, name: fish.name, strain: fish.strain, weightLb: Number(fish.weight_lb), fame: fish.fame, lakeId: fish.lake_id, lakeName: fish.lake_name ?? PrivateWater };
}

export async function loadCarpNames(locals: App.Locals, carpIds: (string | null)[]): Promise<Record<string, string>> {
	const distinctIds = [...new Set(carpIds.filter((carpId): carpId is string => Boolean(carpId)))];
	if (distinctIds.length === 0) return {};
	const { data: carp } = await locals.supabase.from('carp').select('id, name').in('id', distinctIds);
	const living = Object.fromEntries(((carp ?? []) as NamedRow[]).map((fish) => [fish.id, fish.name]));
	const remembered = await loadMemorialNames(locals, distinctIds.filter((carpId) => !(carpId in living)));
	return { ...remembered, ...living };
}
