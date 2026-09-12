import type { Lake } from '$lib/domain/types';
import { requireUser } from '../gates/requireUser';
import type { PublicLakeSummary } from '$lib/contracts/PublicLakeSummary';

export async function GetPublicLakes(locals: App.Locals): Promise<PublicLakeSummary[]> {
	requireUser(locals);
	const { data: lakes } = await locals.supabase
		.from('lakes')
		.select('*, profiles!lakes_owner_id_fkey(display_name), carp!carp_lake_id_fkey(weight_lb)')
		.eq('is_public', true)
		.order('reputation', { ascending: false });
	return (lakes ?? []).map(summarise);
}

type LakeRow = Lake & { profiles: { display_name: string } | null; carp: { weight_lb: number }[] };

function summarise(row: unknown): PublicLakeSummary {
	const { profiles, carp, ...lake } = row as LakeRow;
	const weights = carp.map((fish) => Number(fish.weight_lb));
	return {
		lake: lake as Lake,
		ownerName: profiles?.display_name ?? 'Unknown owner',
		carpCount: weights.length,
		heaviestCarpLb: weights.length > 0 ? Math.max(...weights) : 0
	};
}
