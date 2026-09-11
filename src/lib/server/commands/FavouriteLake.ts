import { fail } from '@sveltejs/kit';
import { requireUser } from '../gates/requireUser';

const FavouriteKey = 'profile_id,lake_id';

export async function FavouriteLake(locals: App.Locals, formData: FormData) {
	const user = requireUser(locals);
	const lakeId = String(formData.get('lakeId') ?? '');
	if (lakeId === '') return fail(400, { message: 'Which water?' });

	const favourite = { profile_id: user.id, lake_id: lakeId };
	const { error } = await locals.supabase.from('favourite_lakes').upsert(favourite, { onConflict: FavouriteKey, ignoreDuplicates: true });
	if (error) return fail(500, { message: `Could not favourite that water: ${error.message}` });
	return { message: 'Added to your favourites' };
}
