import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { findSwim, loadSwimsOf, readSwimName } from './swimGates';

export async function RenameSwim(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const found = findSwim(await loadSwimsOf(locals, lake.id), formData);
	if (found.failure) return found.failure;
	const name = readSwimName(formData, found.others);
	if (name.failure) return name.failure;

	await trustedSupabase().from('swims').update({ name: name.name }).eq('id', found.swim.id);
	return { message: `${found.swim.name} is now ${name.name}` };
}
