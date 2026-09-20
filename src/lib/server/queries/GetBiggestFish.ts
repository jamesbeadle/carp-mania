import type { SupabaseClient } from '@supabase/supabase-js';
import type { BiggestFishInTheGame } from '$lib/contracts/BiggestFish';

type Row = { carp_id: string; carp_name: string; weight_lb: number; lake_id: string; lake_name: string; is_open: boolean };

export async function GetBiggestFish(supabase: SupabaseClient): Promise<BiggestFishInTheGame | null> {
	const { data } = await supabase.rpc('biggest_fish_in_the_game');
	const [row] = (data ?? []) as Row[];
	if (!row) return null;
	const { carp_id: carpId, carp_name: carpName, lake_id: lakeId, lake_name: lakeName, is_open: isOpen } = row;
	return { carpId, carpName, weightLb: Number(row.weight_lb), lakeId, lakeName, isOpen };
}
