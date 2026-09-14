import type { WorkStatus } from '$lib/domain/worldTypes';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const InProgress: WorkStatus = 'in_progress';

export async function GetWorksInProgressCount(locals: App.Locals): Promise<number> {
	const lake = await requireOwnedLake(locals);
	const { count } = await locals.supabase.from('lake_works').select('id', { count: 'exact', head: true }).eq('lake_id', lake.id).eq('status', InProgress);
	return count ?? 0;
}
