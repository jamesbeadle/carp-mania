import type { LayoutServerLoad } from './$types';
import { GetUnreadCount } from '$lib/server/queries/GetUnreadCount';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	const unreadCount = user ? await GetUnreadCount(locals) : 0;
	return { session, user, unreadCount };
};
