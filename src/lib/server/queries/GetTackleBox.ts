import type { TackleBox } from '$lib/contracts/TackleBox';
import type { RodSetup } from '$lib/domain/tackle/rodSetup';
import type { OwnedTackle } from '$lib/domain/tackle/tackleBox';
import { requireUser } from '../gates/requireUser';
import { loadRatingOf } from './loadAnglerRating';

interface OwnedRow {
	item_id: string;
	quantity: number;
	spoils_at: string | null;
}

export async function GetTackleBox(locals: App.Locals): Promise<TackleBox> {
	const user = requireUser(locals);
	const loads = [loadOwnedTackle(locals, user.id), loadSavedRods(locals, user.id), loadRatingOf(locals, user.id)] as const;
	const [owned, savedRods, rating] = await Promise.all(loads);
	return { owned, savedRods, rating };
}

export async function loadOwnedTackle(locals: App.Locals, profileId: string): Promise<OwnedTackle[]> {
	const { data } = await locals.supabase.from('tackle_owned').select('item_id, quantity, spoils_at').eq('profile_id', profileId);
	return ((data ?? []) as OwnedRow[]).map((row) => ({ itemId: row.item_id, quantity: Number(row.quantity), spoilsAt: row.spoils_at }));
}

async function loadSavedRods(locals: App.Locals, profileId: string): Promise<RodSetup[]> {
	const { data } = await locals.supabase.from('profiles').select('saved_rods').eq('id', profileId).maybeSingle();
	return ((data as { saved_rods: RodSetup[] } | null)?.saved_rods ?? []) as RodSetup[];
}
