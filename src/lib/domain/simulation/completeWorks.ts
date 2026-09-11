import { applyCompletedWork } from '../groundworks/applyCompletedWorks';
import { byCompletion, draftOf, isDueBy } from '../groundworks/worksLedger';
import type { Lake } from '../types';
import type { LakeWork } from '../worldTypes';

export interface WorksCompletion {
	lake: Lake;
	completed: LakeWork[];
}

export function completeDueWorks(lake: Lake, works: LakeWork[], at: Date): WorksCompletion {
	const due = works.filter((work) => isDueBy(work, at)).sort(byCompletion);
	const finished = due.reduce((current, work) => ({ ...current, ...applyCompletedWork(current, draftOf(work), work.id).lake }), lake);
	return { lake: finished, completed: due.map((work) => ({ ...work, status: 'complete' as const })) };
}
