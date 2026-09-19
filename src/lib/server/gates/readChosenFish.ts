import { fail } from '@sveltejs/kit';
import type { Carp } from '$lib/domain/types';

const CarpIdField = 'carpId';
const MostFishAtOnce = 200;

export function readChosenFishIds(formData: FormData) {
	const ids = [...new Set(formData.getAll(CarpIdField).map(String).filter((id) => id !== ''))];
	if (ids.length === 0) return { value: null, failure: fail(400, { message: 'Choose at least one fish' }) };
	if (ids.length > MostFishAtOnce) return { value: null, failure: fail(400, { message: `${MostFishAtOnce} fish at a time is the most the lorry takes` }) };
	return { value: ids, failure: null };
}

export async function loadChosenFishInLake(locals: App.Locals, ids: string[], lakeId: string): Promise<Carp[]> {
	const { data: carp } = await locals.supabase.from('carp').select('*').in('id', ids).eq('lake_id', lakeId);
	return (carp ?? []) as Carp[];
}

export function whyChosenFishAreMissing(chosenIds: string[], found: Carp[]) {
	if (found.length === chosenIds.length) return null;
	return 'Some of those fish are not in your water';
}
