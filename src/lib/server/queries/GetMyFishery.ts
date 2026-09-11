import type { Carp, Catch, Lake, LakeVisit, Swim } from '$lib/domain/types';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const RecentHistoryLimit = 40;

export interface MyFishery {
	lake: Lake;
	swims: Swim[];
	carp: Carp[];
	catches: Catch[];
	visits: LakeVisit[];
}

export async function GetMyFishery(locals: App.Locals): Promise<MyFishery> {
	const lake = await requireOwnedLake(locals);
	const [swims, carp, catches, visits] = await Promise.all([
		locals.supabase.from('swims').select('*').eq('lake_id', lake.id).order('name'),
		locals.supabase.from('carp').select('*').eq('lake_id', lake.id).order('weight_lb', { ascending: false }),
		locals.supabase.from('catches').select('*').eq('lake_id', lake.id).order('caught_at', { ascending: false }).limit(RecentHistoryLimit),
		locals.supabase.from('lake_visits').select('*').eq('lake_id', lake.id).order('visited_at', { ascending: false }).limit(RecentHistoryLimit)
	]);
	return {
		lake,
		swims: (swims.data ?? []) as Swim[],
		carp: (carp.data ?? []) as Carp[],
		catches: (catches.data ?? []) as Catch[],
		visits: (visits.data ?? []) as LakeVisit[]
	};
}
