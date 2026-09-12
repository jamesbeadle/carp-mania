import type { CarpTransfer } from '$lib/domain/marketTypes';
import type { Catch } from '$lib/domain/types';

const CatchHistoryLimit = 50;

export async function loadCatchesOf(locals: App.Locals, carpId: string): Promise<Catch[]> {
	const { data: catches } = await locals.supabase.from('catches').select('*').eq('carp_id', carpId).order('caught_at', { ascending: false }).limit(CatchHistoryLimit);
	return (catches ?? []) as Catch[];
}

export async function loadHeaviestCatchLbOf(locals: App.Locals, carpId: string): Promise<number> {
	const { data: heaviest } = await locals.supabase.from('catches').select('weight_lb').eq('carp_id', carpId).order('weight_lb', { ascending: false }).limit(1).maybeSingle();
	return heaviest ? Number(heaviest.weight_lb) : 0;
}

export async function loadTransfersOf(locals: App.Locals, carpId: string): Promise<CarpTransfer[]> {
	const { data: transfers } = await locals.supabase.from('carp_transfers').select('*').eq('carp_id', carpId).order('departed_at', { ascending: false });
	return (transfers ?? []) as CarpTransfer[];
}

export async function loadLakeNames(locals: App.Locals, lakeIds: (string | null)[]): Promise<Record<string, string>> {
	const distinctIds = [...new Set(lakeIds.filter((lakeId): lakeId is string => lakeId !== null))];
	if (distinctIds.length === 0) return {};
	const { data: lakes } = await locals.supabase.from('lakes').select('id, name').in('id', distinctIds);
	return Object.fromEntries(((lakes ?? []) as { id: string; name: string }[]).map((lake) => [lake.id, lake.name]));
}
