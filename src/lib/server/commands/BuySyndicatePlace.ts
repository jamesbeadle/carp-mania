import { fail } from '@sveltejs/kit';
import { requireUser } from '../gates/requireUser';

export async function BuySyndicatePlace(locals: App.Locals, lakeId: string) {
	requireUser(locals);
	const { error } = await locals.supabase.rpc('buy_syndicate_place', { lake: lakeId });
	if (error) return fail(400, { message: error.message });
	return { message: 'You are in the syndicate for the year — fish whenever you like' };
}
