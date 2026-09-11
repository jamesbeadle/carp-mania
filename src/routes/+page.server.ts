import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const homeForSignedInPlayers = '/home';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) redirect(303, homeForSignedInPlayers);
	return { hasSignInError: url.searchParams.get('error') === 'sign-in-failed' };
};

export const actions: Actions = {
	signInWithGoogle: async ({ locals, url }) => {
		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo: `${url.origin}/auth/callback` }
		});
		if (error || !data.url) redirect(303, '/?error=sign-in-failed');
		redirect(303, data.url);
	}
};
