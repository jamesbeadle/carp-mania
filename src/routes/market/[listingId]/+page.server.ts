import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/gates/requireUser';

const HttpStatus = { NotFound: 404, MovedForGood: 301 } as const;

export const load: PageServerLoad = async ({ locals, params }) => {
	requireUser(locals);
	const { data: listing } = await locals.supabase.from('listings').select('carp_id').eq('id', params.listingId).maybeSingle();
	if (!listing) error(HttpStatus.NotFound, 'The fish market has closed and that listing is gone');
	redirect(HttpStatus.MovedForGood, `/carp/${(listing as { carp_id: string }).carp_id}`);
};
