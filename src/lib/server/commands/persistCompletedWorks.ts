import type { SupabaseClient } from '@supabase/supabase-js';
import { workLabelFor } from '$lib/domain/groundworks/workLabels';
import { draftOf } from '$lib/domain/groundworks/worksLedger';
import type { DayOutcome } from '$lib/domain/simulation/simulateOneDay';
import { islandBuiltEvent, type NewWorldEvent } from '$lib/domain/simulation/worldEvents';
import type { Lake } from '$lib/domain/types';
import type { LakeWork } from '$lib/domain/worldTypes';
import type { NewNotification } from './arrivalNotifications';

const WorksLedgerLink = '/lake/works';

export async function persistCompletedWorks(trusted: SupabaseClient, lake: Lake, outcomes: DayOutcome[], profileId: string) {
	const completed = outcomes.flatMap((day) => day.worksCompleted);
	if (completed.length === 0) return;
	await trusted.from('lake_works').update({ status: 'complete' }).in('id', completed.map((work) => work.id));
	await trusted.from('notifications').insert(completed.map((work) => worksCompleteNotification(profileId, work)));
	const events = completed.flatMap((work) => islandEventsFor(lake, work));
	if (events.length > 0) await trusted.from('world_events').insert(events);
}

function worksCompleteNotification(profileId: string, work: LakeWork): NewNotification {
	const label = workLabelFor(draftOf(work));
	return { profile_id: profileId, kind: 'works_complete', title: `${label} finished`, body: `The diggers have packed up: ${label.toLowerCase()} is done and the water is settling.`, link: WorksLedgerLink };
}

function islandEventsFor(lake: Lake, work: LakeWork): NewWorldEvent[] {
	const draft = draftOf(work);
	if (draft.kind !== 'island') return [];
	return [islandBuiltEvent(lake.id, lake.name, draft.name)];
}
