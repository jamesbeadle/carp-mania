import type { LayoutServerLoad } from './$types';
import { GetHudSummary, type HudSummary } from '$lib/server/queries/GetHudSummary';
import { GetUnreadCount } from '$lib/server/queries/GetUnreadCount';

const SignedOutHud: HudSummary = { money: 0 };

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!user) return { session, user, unreadCount: 0, hud: SignedOutHud };
	const [unreadCount, hud] = await Promise.all([GetUnreadCount(locals), GetHudSummary(locals)]);
	return { session, user, unreadCount, hud };
};
