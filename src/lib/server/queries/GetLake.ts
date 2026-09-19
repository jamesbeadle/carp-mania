import { error } from '@sveltejs/kit';
import type { RecentCatches } from '$lib/contracts/RecentCatches';
import type { Shoal } from '$lib/domain/stock/shoals';
import type { Carp, Lake, Swim } from '$lib/domain/types';
import { requireUser } from '../gates/requireUser';
import { loadRecentCatches } from './loadRecentCatches';

export interface LakeForAnglers {
	lake: Lake;
	ownerName: string;
	swims: Swim[];
	carp: Carp[];
	shoals: Shoal[];
	catches: RecentCatches;
}

export async function GetLake(locals: App.Locals, lakeId: string): Promise<LakeForAnglers> {
	requireUser(locals);
	const { data: lakeRow } = await locals.supabase.from('lakes').select('*, profiles!lakes_owner_id_fkey(display_name)').eq('id', lakeId).maybeSingle();
	if (!lakeRow) error(404, 'That lake is not open to anglers');

	const { profiles, ...lake } = lakeRow as { profiles: { display_name: string } | null } & Lake;
	const [swims, carp, shoals, catches] = await Promise.all([
		locals.supabase.from('swims').select('*').eq('lake_id', lakeId).order('name'),
		locals.supabase.from('carp').select('*').eq('lake_id', lakeId).order('weight_lb', { ascending: false }),
		locals.supabase.from('carp_shoals').select('*').eq('lake_id', lakeId).order('average_weight_lb', { ascending: false }),
		loadRecentCatches(locals, lakeId, new Date())
	]);
	return {
		lake: lake as Lake,
		ownerName: profiles?.display_name ?? 'Unknown owner',
		swims: (swims.data ?? []) as Swim[],
		carp: (carp.data ?? []) as Carp[],
		shoals: (shoals.data ?? []) as Shoal[],
		catches
	};
}
