import { fail } from '@sveltejs/kit';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const BailiffField = 'bailiffId';

export async function SackBailiff(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const bailiffId = String(formData.get(BailiffField) ?? '');
	const { error } = await locals.supabase.rpc('sack_bailiff', { lake: lake.id, bailiff: bailiffId });
	if (error) return fail(400, { message: error.message });
	return { message: 'Sacked. The lodge key is back on the hook.' };
}
