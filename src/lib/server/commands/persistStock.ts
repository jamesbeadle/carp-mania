import type { SupabaseClient } from '@supabase/supabase-js';
import type { Shoal } from '$lib/domain/stock/shoals';
import type { Carp } from '$lib/domain/types';

export interface StockBefore {
	carp: Carp[];
	shoals: Shoal[];
}

export type StockAfter = StockBefore;

export const ProvisionalIds = { NamedFish: 'named-', FryShoal: 'fry-' } as const;

interface Row {
	id: string;
}

export async function persistStock(trusted: SupabaseClient, before: StockBefore, after: StockAfter) {
	const fish = sortedForWriting(before.carp, after.carp, ProvisionalIds.NamedFish);
	const shoals = sortedForWriting(before.shoals, after.shoals, ProvisionalIds.FryShoal);
	if (fish.changed.length > 0) await trusted.from('carp').upsert(fish.changed, { onConflict: 'id' });
	if (fish.added.length > 0) await trusted.from('carp').insert(fish.added);
	if (shoals.changed.length > 0) await trusted.from('carp_shoals').upsert(shoals.changed, { onConflict: 'id' });
	if (shoals.added.length > 0) await trusted.from('carp_shoals').insert(shoals.added);
	if (shoals.gone.length > 0) await trusted.from('carp_shoals').delete().in('id', shoals.gone);
}

export function rowsThatWouldBeWritten(before: StockBefore, after: StockAfter) {
	const fish = sortedForWriting(before.carp, after.carp, ProvisionalIds.NamedFish);
	const shoals = sortedForWriting(before.shoals, after.shoals, ProvisionalIds.FryShoal);
	return fish.added.length + fish.changed.length + shoals.added.length + shoals.changed.length;
}

function sortedForWriting<Kind extends Row>(before: Kind[], after: Kind[], newPrefix: string) {
	const isNew = (row: Kind) => row.id.startsWith(newPrefix);
	const kept = after.filter((row) => !isNew(row));
	const keptIds = new Set(kept.map((row) => row.id));
	return {
		added: after.filter(isNew).map(withoutId),
		changed: kept.filter((row) => hasChanged(row, before)),
		gone: before.filter((row) => !keptIds.has(row.id)).map((row) => row.id)
	};
}

function hasChanged<Kind extends Row>(row: Kind, before: Kind[]) {
	const earlier = before.find((candidate) => candidate.id === row.id);
	return earlier === undefined || JSON.stringify(earlier) !== JSON.stringify(row);
}

function withoutId<Kind extends Row>(row: Kind): Omit<Kind, 'id'> {
	const { id: _id, ...rest } = row;
	return rest;
}
