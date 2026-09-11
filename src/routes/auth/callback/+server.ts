import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const homeAfterSignIn = '/home';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	if (!code) redirect(303, '/');

	const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
	if (error) redirect(303, '/?error=sign-in-failed');

	redirect(303, homeAfterSignIn);
};
