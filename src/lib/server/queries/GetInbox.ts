import type { Notification } from '$lib/domain/worldTypes';
import { requireUser } from '../gates/requireUser';
import { GetUnreadCount } from './GetUnreadCount';

const InboxLimit = 100;

export interface Inbox {
	notifications: Notification[];
	unreadCount: number;
}

export async function GetInbox(locals: App.Locals): Promise<Inbox> {
	const user = requireUser(locals);
	const [{ data: notifications }, unreadCount] = await Promise.all([
		locals.supabase.from('notifications').select('*').eq('profile_id', user.id).order('created_at', { ascending: false }).limit(InboxLimit),
		GetUnreadCount(locals)
	]);
	return { notifications: (notifications ?? []) as Notification[], unreadCount };
}
