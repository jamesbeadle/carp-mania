import { redirect, type Handle } from '@sveltejs/kit';
import { whereTheLicenceSendsYou } from '$lib/server/gates/licenceGate';
import { isUnderAny } from '$lib/server/gates/pathRoots';
import { whereSetupSendsYou } from '$lib/server/gates/setupGate';
import { createServerSupabase } from '$lib/supabase/createServerSupabase';
import { safeGetSession } from '$lib/supabase/safeGetSession';

const publicPaths = ['/', '/auth/callback', '/auth/signout', '/privacy', '/terms', '/rules'];
const PublicRoots = ['/portrait'];

function isPublicPath(pathname: string) {
	return publicPaths.includes(pathname) || isUnderAny(pathname, PublicRoots);
}

async function whereTheGatesSendYou(locals: App.Locals, anglerId: string, pathname: string) {
	const licenceDestination = await whereTheLicenceSendsYou(locals, anglerId, pathname);
	return licenceDestination ?? whereSetupSendsYou(locals, anglerId, pathname);
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
		const destination = await whereTheGatesSendYou(event.locals, user.id, pathname);
		if (destination) redirect(303, destination);
	}

	return resolve(event, {
		filterSerializedResponseHeaders: (name) => name === 'content-range' || name === 'x-supabase-api-version'
	});
};
