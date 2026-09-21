import { error, json } from '@sveltejs/kit';
import type { RodSetSaved, SaveRodSetOrder } from '$lib/contracts/RodSets';
import { whyCannotSaveRodSet } from '$lib/domain/tackle/rodSets';
import { readRodSetups } from '../gates/readRodSetups';
import { requireUser } from '../gates/requireUser';
import { loadRodSets } from '../queries/loadRodSets';

const HttpStatus = { BadRequest: 400, ServerError: 500 } as const;

export async function SaveRodSet(locals: App.Locals, candidate: unknown) {
	const user = requireUser(locals);
	const order = candidate as Partial<SaveRodSetOrder> | null;
	const name = String(order?.name ?? '').trim();
	const { setups, failure } = readRodSetups(order?.rods);
	if (failure) error(failure.status, failure.data.message);
	const sets = await loadRodSets(locals, user.id);
	const refusal = whyCannotSaveRodSet(sets, name);
	if (refusal) error(HttpStatus.BadRequest, refusal);
	const row = { profile_id: user.id, name, rods: setups, last_used_at: new Date().toISOString() };
	const { data, error: saveError } = await locals.supabase.from('rod_sets').upsert(row, { onConflict: 'profile_id,name' }).select('id, name, last_used_at').single();
	if (saveError || !data) error(HttpStatus.ServerError, saveError?.message ?? 'The set was not saved');
	const saved: RodSetSaved = { id: data.id, name: data.name, lastUsedAt: data.last_used_at };
	return json(saved);
}

export async function DropRodSet(locals: App.Locals, setId: string) {
	const user = requireUser(locals);
	const { error: dropError } = await locals.supabase.from('rod_sets').delete().eq('id', setId).eq('profile_id', user.id);
	if (dropError) error(HttpStatus.ServerError, dropError.message);
	return json({ dropped: setId });
}

export async function TouchRodSet(locals: App.Locals, setId: string) {
	const user = requireUser(locals);
	const { error: touchError } = await locals.supabase.from('rod_sets').update({ last_used_at: new Date().toISOString() }).eq('id', setId).eq('profile_id', user.id);
	if (touchError) error(HttpStatus.ServerError, touchError.message);
	return json({ used: setId });
}
