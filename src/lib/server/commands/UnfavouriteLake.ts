import { fail } from '@sveltejs/kit';
import { requireUser } from '../gates/requireUser';

export async function UnfavouriteLake(locals: App.Locals, formData: FormData) {
	const user = requireUser(locals);
	const lakeId = String(formData.get('lakeId') ?? '');
	if (lakeId === '') return fail(400, { message: 'Which water?' });

	const { error } = await locals.supabase.from('favourite_lakes').delete().eq('profile_id', user.id).eq('lake_id', lakeId);
	if (error) return fail(500, { message: `Could not remove that favourite: ${error.message}` });
	return { message: 'Removed from your favourites' };
}
