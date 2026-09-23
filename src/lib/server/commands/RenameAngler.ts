import { fail } from '@sveltejs/kit';
import { anglerNameRuleWords, isAnglerName } from '$lib/domain/anglerName';
import { requireUser } from '../gates/requireUser';

const Field = 'name';

export async function RenameAngler(locals: App.Locals, formData: FormData) {
	requireUser(locals);
	const name = String(formData.get(Field) ?? '').trim();
	if (!isAnglerName(name)) return fail(400, { message: `An angler name is ${anglerNameRuleWords()}` });
	const { error } = await locals.supabase.rpc('rename_angler', { new_name: name });
	if (error) return fail(400, { message: error.message });
	return { message: `You fish as ${name} now` };
}
