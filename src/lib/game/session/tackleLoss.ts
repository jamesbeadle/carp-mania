import { layoutScaleFor, feetBetween } from '$lib/domain/layout/layoutScale';
import { swimPoint } from '$lib/domain/layout/swimRules';
import { feetToMetres } from '$lib/domain/tackle/castDistance';
import type { TackleLossKind } from '$lib/domain/tackle/losses';
import type { Lake } from '$lib/domain/types';
import { toFraction, type Point } from '../scene/lakeShape';
import type { SessionState } from './sessionState.svelte';

export interface TackleLoss {
	kind: TackleLossKind;
	rodIndex: number;
	castPoint: Point;
	hoursFished?: number;
}

export interface TackleLossReport {
	visitId: string;
	kind: TackleLossKind;
	rodIndex: number;
	castDistanceMetres: number;
	hoursFished: number;
	setup: unknown;
}

export async function reportTackleLoss(lakeId: string, report: TackleLossReport) {
	const response = await fetch(`/fish/${lakeId}/loss`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(report)
	});
	return response.ok;
}

let reportedLosses = 0;

export function reportLossesAsTheyHappen(lake: Lake, visitId: string, session: SessionState, lossCount: number) {
	if (lossCount <= reportedLosses || !session.swim) return;
	const scale = layoutScaleFor(Number(lake.plot_acres));
	const peg = swimPoint(session.swim);
	for (const loss of session.tackleLost.slice(reportedLosses)) {
		const castDistanceMetres = feetToMetres(feetBetween(scale, peg, toFraction(loss.castPoint)));
		const setup = session.rods[loss.rodIndex]?.setup;
		void reportTackleLoss(lake.id, { visitId, kind: loss.kind, rodIndex: loss.rodIndex, castDistanceMetres, hoursFished: loss.hoursFished ?? 0, setup });
	}
	reportedLosses = lossCount;
}
