import type { SupabaseClient } from '@supabase/supabase-js';

export async function loadFishInTheWater(supabase: SupabaseClient, lakeId: string): Promise<number> {
	const { data: count } = await supabase.rpc('fish_in_the_water', { lake: lakeId });
	return Number(count ?? 0);
}
