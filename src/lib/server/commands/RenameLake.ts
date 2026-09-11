import { fail } from '@sveltejs/kit';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const LakeName = { MinimumLength: 2, MaximumLength: 40 } as const;

export async function RenameLake(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const name = String(formData.get('name') ?? '').trim();
	const isValid = name.length >= LakeName.MinimumLength && name.length <= LakeName.MaximumLength;
	if (!isValid) return fail(400, { message: `Name must be ${LakeName.MinimumLength}–${LakeName.MaximumLength} characters` });

	await locals.supabase.from('lakes').update({ name }).eq('id', lake.id);
	return { message: `Renamed to ${name}` };
}
