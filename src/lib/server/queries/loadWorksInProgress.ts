import type { LakeWork, WorkStatus } from '$lib/domain/worldTypes';

const InProgress: WorkStatus = 'in_progress';

export async function loadWorksInProgress(locals: App.Locals, lakeId: string): Promise<LakeWork[]> {
	const { data: works } = await locals.supabase.from('lake_works').select('*').eq('lake_id', lakeId).eq('status', InProgress).order('completes_on');
	return (works ?? []) as LakeWork[];
}
