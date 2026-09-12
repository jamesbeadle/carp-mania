import { error } from '@sveltejs/kit';
import type { Lake } from '$lib/domain/types';
import { loadCurrentWater } from '../queries/loadMyWaters';
import { requireUser } from './requireUser';

export async function requireOwnedLake(locals: App.Locals): Promise<Lake> {
	const user = requireUser(locals);
	const lake = await loadCurrentWater(locals, user.id);
	if (!lake) error(404, 'You do not have a fishery yet');
	return lake;
}
