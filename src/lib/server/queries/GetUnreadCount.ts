import { requireUser } from '../gates/requireUser';

export async function GetUnreadCount(locals: App.Locals): Promise<number> {
	const user = requireUser(locals);
	const { count } = await locals.supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('profile_id', user.id).is('read_at', null);
	return count ?? 0;
}
