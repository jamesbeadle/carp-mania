import type { FamousFish } from '$lib/contracts/AnglerPublicProfile';
import type { CarpStrain, Catch } from '$lib/domain/types';

const FamousFromFame = 20;
const FamousFishColumns = 'carp!inner(id, name, strain, weight_lb, fame, lake_id, lakes!carp_lake_id_fkey(name))';
const PrivateWater = 'A private water';

type CatchOrder = 'weight_lb' | 'caught_at';
type FamousCatchRow = {
	carp: { id: string; name: string; strain: CarpStrain; weight_lb: number; fame: number; lake_id: string; lakes: { name: string } | null };
};
type NamedRow = { id: string; name: string };

export function loadHeaviestCatchesBy(locals: App.Locals, anglerId: string, limit: number) {
	return loadCatchesBy(locals, anglerId, 'weight_lb', limit);
}

export function loadLatestCatchesBy(locals: App.Locals, anglerId: string, limit: number) {
	return loadCatchesBy(locals, anglerId, 'caught_at', limit);
}

async function loadCatchesBy(locals: App.Locals, anglerId: string, highestFirst: CatchOrder, limit: number): Promise<Catch[]> {
	const { data: catches } = await locals.supabase
		.from('catches')
		.select('*')
		.eq('angler_id', anglerId)
		.order(highestFirst, { ascending: false })
		.limit(limit);
	return (catches ?? []) as Catch[];
}

export async function loadFamousFishCaughtBy(locals: App.Locals, anglerId: string): Promise<FamousFish[]> {
	const { data: famousCatches } = await locals.supabase
		.from('catches')
		.select(FamousFishColumns)
		.eq('angler_id', anglerId)
		.gte('carp.fame', FamousFromFame);
	const fish = (famousCatches ?? []).map(famousFishFrom);
	return distinctById(fish).sort(mostFamousFirst);
}

function famousFishFrom(row: unknown): FamousFish {
	const { lakes, ...carp } = (row as FamousCatchRow).carp;
	return { id: carp.id, name: carp.name, strain: carp.strain, weightLb: Number(carp.weight_lb), fame: carp.fame, lakeId: carp.lake_id, lakeName: lakes?.name ?? PrivateWater };
}

function distinctById(fish: FamousFish[]) {
	return [...new Map(fish.map((one) => [one.id, one])).values()];
}

function mostFamousFirst(first: FamousFish, second: FamousFish) {
	return second.fame - first.fame;
}

export async function loadCarpNames(locals: App.Locals, carpIds: (string | null)[]): Promise<Record<string, string>> {
	const distinctIds = [...new Set(carpIds.filter((carpId): carpId is string => Boolean(carpId)))];
	if (distinctIds.length === 0) return {};
	const { data: carp } = await locals.supabase.from('carp').select('id, name').in('id', distinctIds);
	return Object.fromEntries(((carp ?? []) as NamedRow[]).map((fish) => [fish.id, fish.name]));
}
