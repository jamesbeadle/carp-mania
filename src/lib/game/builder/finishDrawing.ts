import { isBankDraft } from '$lib/domain/groundworks/draftFootprint';
import type { WorkDraft } from '$lib/domain/groundworks/workKinds';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { BuilderState } from './builderState.svelte';
import { MinimumPointsFor, type DrawnShape } from './drawingHandles';
import { sceneDistance } from './sceneDistance';

const DuplicatePointRadius = 4;

export type PointsDraft = Extract<WorkDraft, { points: LayoutPoint[] }>;

export function isPointsDraft(draft: WorkDraft): draft is PointsDraft {
	return 'points' in draft;
}

export function drawnShapeOf(draft: PointsDraft): DrawnShape {
	return isBankDraft(draft) ? 'polyline' : 'polygon';
}

export function pointsStillNeeded(draft: PointsDraft) {
	return Math.max(0, MinimumPointsFor[drawnShapeOf(draft)] - draft.points.length);
}

export function finishDrawing(builder: BuilderState) {
	const draft = builder.draft;
	if (!builder.isDrawing || !draft || !isPointsDraft(draft)) return;
	const points = withoutTrailingDuplicates(draft.points);
	if (points.length < MinimumPointsFor[drawnShapeOf(draft)]) return;
	builder.place({ ...draft, points });
}

function withoutTrailingDuplicates(points: LayoutPoint[]): LayoutPoint[] {
	const trimmed = [...points];
	while (trimmed.length >= 2 && sceneDistance(trimmed[trimmed.length - 1], trimmed[trimmed.length - 2]) <= DuplicatePointRadius) trimmed.pop();
	return trimmed;
}
