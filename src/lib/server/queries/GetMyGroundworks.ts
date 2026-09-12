import type { LabelledWork, MyGroundworks } from '$lib/contracts/MyGroundworks';
import { workLabelFor } from '$lib/domain/groundworks/workLabels';
import { byCompletion, daysLeftFor, draftOf, isInProgress, refundFor } from '$lib/domain/groundworks/worksLedger';
import type { LakeWork } from '$lib/domain/worldTypes';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const LedgerLimit = 50;

export async function GetMyGroundworks(locals: App.Locals): Promise<MyGroundworks> {
	const lake = await requireOwnedLake(locals);
	const { data: works } = await locals.supabase.from('lake_works').select('*').eq('lake_id', lake.id).order('ordered_at', { ascending: false }).limit(LedgerLimit);
	const lakeClock = new Date(lake.simulated_until);
	const labelled = ((works ?? []) as LakeWork[]).map((work) => labelWork(work, lakeClock));
	return {
		inProgress: labelled.filter(isInProgress).sort(byCompletion),
		ledger: labelled.filter((work) => !isInProgress(work))
	};
}

function labelWork(work: LakeWork, lakeClock: Date): LabelledWork {
	return { ...work, label: workLabelFor(draftOf(work)), daysLeft: daysLeftFor(work, lakeClock), refund: refundFor(work, lakeClock) };
}
