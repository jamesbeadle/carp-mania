import { redirect, type Handle } from '@sveltejs/kit';
import { whereSetupSendsYou } from '$lib/server/gates/setupGate';
import { createServerSupabase } from '$lib/supabase/createServerSupabase';
import { safeGetSession } from '$lib/supabase/safeGetSession';

const publicPaths = ['/', '/auth/callback', '/auth/signout', '/cron/close-matches', '/privacy', '/terms'];

function isPublicPath(pathname: string) {
	return publicPaths.includes(pathname);
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerSupabase(event);
	const sessionForThisRequest = safeGetSession(event.locals.supabase);
	event.locals.safeGetSession = () => sessionForThisRequest;

	const { user } = await sessionForThisRequest;
	event.locals.user = user;

	const pathname = event.url.pathname;
	if (!user && !isPublicPath(pathname)) redirect(303, '/');
	if (user && !isPublicPath(pathname)) {
		const destination = await whereSetupSendsYou(event.locals, user.id, pathname);
		if (destination) redirect(303, destination);
	}

	return resolve(event, {
		filterSerializedResponseHeaders: (name) => name === 'content-range' || name === 'x-supabase-api-version'
	});
};
