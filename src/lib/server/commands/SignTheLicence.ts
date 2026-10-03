import { fail } from '@sveltejs/kit';
import { LicenceField } from '$lib/contracts/AnglerLicence';
import { anglerNameRuleWords, isAnglerName } from '$lib/domain/anglerName';
import { lookFromCode, portraitPathOf } from '$lib/domain/portrait/portraitLook';
import { requireUser } from '../gates/requireUser';

const HttpStatus = { BadRequest: 400 } as const;

export async function SignTheLicence(locals: App.Locals, formData: FormData) {
	requireUser(locals);
	const name = String(formData.get(LicenceField.Name) ?? '').trim();
	const look = lookFromCode(String(formData.get(LicenceField.Look) ?? ''));
	const nameRule = `An angler name is ${anglerNameRuleWords()}`;
	if (!isAnglerName(name)) return fail(HttpStatus.BadRequest, { message: nameRule });
	if (!look) return fail(HttpStatus.BadRequest, { message: 'Make your angler before signing the licence' });
	const { error } = await locals.supabase.rpc('sign_the_licence', { new_name: name, portrait: portraitPathOf(look) });
	if (error) return fail(HttpStatus.BadRequest, { message: error.message });
	return null;
}
