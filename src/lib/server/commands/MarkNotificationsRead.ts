import { fail } from '@sveltejs/kit';
import { requireUser } from '../gates/requireUser';

export async function MarkAllNotificationsRead(locals: App.Locals) {
	const user = requireUser(locals);
	const { error } = await markUnreadAsRead(locals, user.id);
	if (error) return fail(500, { message: error.message });
	return { message: 'Nothing left unread' };
}

export async function MarkNotificationRead(locals: App.Locals, formData: FormData) {
	const user = requireUser(locals);
	const notificationId = String(formData.get('notificationId') ?? '');
	if (notificationId === '') return fail(400, { message: 'Which message?' });

	const { error } = await markUnreadAsRead(locals, user.id).eq('id', notificationId);
	if (error) return fail(500, { message: error.message });
	return { message: 'Marked read' };
}

function markUnreadAsRead(locals: App.Locals, profileId: string) {
	return locals.supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('profile_id', profileId).is('read_at', null);
}
