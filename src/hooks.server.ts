import { redirect, type Handle } from '@sveltejs/kit';
import { createServerSupabase } from '$lib/supabase/createServerSupabase';
import { safeGetSession } from '$lib/supabase/safeGetSession';

const publicPaths = ['/', '/auth/callback', '/auth/signout'];

function isPublicPath(pathname: string) {
	return publicPaths.includes(pathname);
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerSupabase(event);
	event.locals.safeGetSession = () => safeGetSession(event.locals.supabase);

	const { user } = await event.locals.safeGetSession();
	event.locals.user = user;

	const isSignedIn = user !== null;
	if (!isSignedIn && !isPublicPath(event.url.pathname)) redirect(303, '/');

	return resolve(event, {
		filterSerializedResponseHeaders: (name) => name === 'content-range' || name === 'x-supabase-api-version'
	});
};
