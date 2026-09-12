import type { Trophy } from '$lib/domain/matches/matchTypes';

const Newest = { ascending: false } as const;

export async function loadTrophiesOf(locals: App.Locals, fishermanId: string): Promise<Trophy[]> {
	const { data } = await locals.supabase.from('trophies').select('*').eq('fisherman_id', fishermanId).order('won_at', Newest);
	return (data ?? []) as Trophy[];
}
