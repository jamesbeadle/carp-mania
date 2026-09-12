import type { Actions, PageServerLoad } from './$types';
import { inboxFiltersFrom } from '$lib/domain/lists/inboxFilters';
import { MarkAllNotificationsRead, MarkNotificationRead } from '$lib/server/commands/MarkNotificationsRead';
import { GetInbox } from '$lib/server/queries/GetInbox';

export const load: PageServerLoad = async ({ locals, url }) => {
	return { inbox: await GetInbox(locals, inboxFiltersFrom(url.searchParams)) };
};

export const actions: Actions = {
	markAllRead: ({ locals }) => MarkAllNotificationsRead(locals),
	markRead: ({ locals, request }) => request.formData().then((formData) => MarkNotificationRead(locals, formData))
};
