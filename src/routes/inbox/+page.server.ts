import type { Actions, PageServerLoad } from './$types';
import { MarkAllNotificationsRead, MarkNotificationRead } from '$lib/server/commands/MarkNotificationsRead';
import { GetInbox } from '$lib/server/queries/GetInbox';

export const load: PageServerLoad = async ({ locals }) => {
	return { inbox: await GetInbox(locals) };
};

export const actions: Actions = {
	markAllRead: ({ locals }) => MarkAllNotificationsRead(locals),
	markRead: ({ locals, request }) => request.formData().then((formData) => MarkNotificationRead(locals, formData))
};
