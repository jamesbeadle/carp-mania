import type { SupabaseClient } from '@supabase/supabase-js';
import type { PrototypeOnTheBoard } from '$lib/contracts/Prototypes';
import { prototypeItem } from '$lib/domain/tackle/prototypes';

type Row = { item_id: string; brand: string; number: number; holder_id: string | null; holder_name: string; won_at: string; is_destroyed: boolean; destroyed_at: string | null };

export async function GetPrototypes(supabase: SupabaseClient): Promise<PrototypeOnTheBoard[]> {
	const { data } = await supabase.from('prototypes').select('item_id, brand, number, holder_id, holder_name, won_at, is_destroyed, destroyed_at').order('won_at', { ascending: false });
	return ((data ?? []) as Row[]).map(boardLineFrom);
}

function boardLineFrom(row: Row): PrototypeOnTheBoard {
	const item = prototypeItem(row.item_id);
	return {
		itemId: row.item_id,
		label: item?.label ?? row.item_id,
		brand: row.brand,
		number: row.number,
		holderId: row.holder_id,
		holderName: row.holder_name,
		wonAt: row.won_at,
		isDestroyed: row.is_destroyed,
		destroyedAt: row.destroyed_at
	};
}
