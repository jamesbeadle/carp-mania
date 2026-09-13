import type { WorkDraft } from '$lib/domain/groundworks/workKinds';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { DraftShape } from '../render/drawUnderConstruction';
import { handlesWhileDrawing, isOnFinishHandle, rubberBandEndFor } from './drawingHandles';
import { drawnShapeOf, isPointsDraft, pointsStillNeeded } from './finishDrawing';

const ClickToFinishCue = ' — click to finish';

export function shapeWhileDrawing(draft: WorkDraft, hover: LayoutPoint | null, label: string, failures: string[]): DraftShape[] {
	if (draft.kind === 'reshape_shoreline') return [{ kind: 'polygon', points: draft.outline, label, isValid: failures.length === 0 }];
	if (!isPointsDraft(draft)) return [];
	const shape = drawnShapeOf(draft);
	const end = rubberBandEndFor(shape, draft.points, hover);
	const isSnapped = isOnFinishHandle(shape, draft.points, hover);
	const ruleBroken = ruleBrokenWhileDrawing(draft, failures);
	return [
		{
			kind: shape,
			points: end ? [...draft.points, end] : draft.points,
			label: labelWhileDrawing(label, ruleBroken, isSnapped),
			isValid: ruleBroken === null,
			isBeingDrawn: true,
			handles: handlesWhileDrawing(shape, draft.points, hover)
		}
	];
}

export function ruleBrokenWhileDrawing(draft: WorkDraft, failures: string[]): string | null {
	if (!isPointsDraft(draft) || pointsStillNeeded(draft) > 0) return null;
	return failures[0] ?? null;
}

function labelWhileDrawing(label: string, ruleBroken: string | null, isSnapped: boolean) {
	if (ruleBroken) return `${label} — ${asAClause(ruleBroken)}`;
	return isSnapped ? `${label}${ClickToFinishCue}` : label;
}

function asAClause(sentence: string) {
	return sentence.charAt(0).toLowerCase() + sentence.slice(1);
}
