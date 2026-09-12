import { InboxListing, type InboxFilters } from '$lib/domain/lists/inboxFilters';
import { listPageOf, rangeOf, type ListPage } from '$lib/domain/lists/paging';
import type { Notification } from '$lib/domain/worldTypes';
import { requireUser } from '../gates/requireUser';
import { GetUnreadCount } from './GetUnreadCount';

export interface Inbox {
	notes: ListPage<Notification>;
	unreadCount: number;
	filters: InboxFilters;
}

export async function GetInbox(locals: App.Locals, filters: InboxFilters): Promise<Inbox> {
	const user = requireUser(locals);
	const page = { number: filters.page, size: InboxListing.PageSize };
	const { from, to } = rangeOf(page);
	let query = locals.supabase.from('notifications').select('*', { count: 'exact' }).eq('profile_id', user.id);
	if (filters.isUnreadOnly) query = query.is('read_at', null);
	const [{ data, count }, unreadCount] = await Promise.all([query.order('created_at', { ascending: false }).order('id').range(from, to), GetUnreadCount(locals)]);
	return { notes: listPageOf((data ?? []) as Notification[], count ?? 0, page), unreadCount, filters };
}
