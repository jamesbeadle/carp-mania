import type { LakeWork, Notification, WorkStatus } from '$lib/domain/worldTypes';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const InProgress: WorkStatus = 'in_progress';
const InboxPreviewLimit = 3;

export interface HomeHub {
	works: LakeWork[];
	unreadNotifications: Notification[];
}

export async function GetHomeHub(locals: App.Locals): Promise<HomeHub> {
	const lake = await requireOwnedLake(locals);
	const [{ data: works }, { data: unreadNotifications }] = await Promise.all([
		locals.supabase.from('lake_works').select('*').eq('lake_id', lake.id).eq('status', InProgress).order('completes_on'),
		locals.supabase.from('notifications').select('*').eq('profile_id', lake.owner_id).is('read_at', null).order('created_at', { ascending: false }).limit(InboxPreviewLimit)
	]);
	return { works: (works ?? []) as LakeWork[], unreadNotifications: (unreadNotifications ?? []) as Notification[] };
}
