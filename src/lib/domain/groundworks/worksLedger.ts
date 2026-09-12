import { FisheryClock } from '../simulation/elapsedDays';
import type { LakeWork } from '../worldTypes';
import { WorksInProgress } from './catalogue';
import { isWorkKind, type WorkDraft } from './workKinds';

export function completesOn(startsOn: Date, days: number) {
	return new Date(startsOn.getTime() + days * FisheryClock.RealMillisecondsPerFisheryDay);
}

export function isInProgress(work: Pick<LakeWork, 'status'>) {
	return work.status === 'in_progress';
}

export function isDueBy(work: Pick<LakeWork, 'status' | 'completes_on'>, at: Date) {
	return isInProgress(work) && new Date(work.completes_on).getTime() <= at.getTime();
}

export function daysLeftFor(work: Pick<LakeWork, 'completes_on'>, at: Date) {
	const millisecondsLeft = new Date(work.completes_on).getTime() - at.getTime();
	return Math.max(0, Math.ceil(millisecondsLeft / FisheryClock.RealMillisecondsPerFisheryDay));
}

export function refundFor(work: Pick<LakeWork, 'cost' | 'starts_on'>, at: Date) {
	const diggersStartAt = completesOn(new Date(work.starts_on), WorksInProgress.CancelWithinFisheryDays);
	const isBeforeTheDiggersStart = at.getTime() < diggersStartAt.getTime();
	return isBeforeTheDiggersStart ? Math.round(Number(work.cost) * WorksInProgress.CancelRefundShare) : 0;
}

export function draftOf(work: Pick<LakeWork, 'kind' | 'parameters'>): WorkDraft {
	if (!isWorkKind(work.kind)) throw new Error(`${work.kind} is not a kind of groundworks`);
	return { ...work.parameters, kind: work.kind } as WorkDraft;
}

export function byCompletion(first: Pick<LakeWork, 'completes_on'>, second: Pick<LakeWork, 'completes_on'>) {
	return new Date(first.completes_on).getTime() - new Date(second.completes_on).getTime();
}
