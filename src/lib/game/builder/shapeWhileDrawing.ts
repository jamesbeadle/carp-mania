import type { WorkDraft } from '$lib/domain/groundworks/workKinds';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { DraftShape } from '../render/drawUnderConstruction';
import { handlesWhileDrawing, isOnFinishHandle, rubberBandEndFor } from './drawingHandles';
import { drawnShapeOf, isPointsDraft, pointsStillNeeded } from './finishDrawing';

const ClickToFinishCue = ' — click to finish';

export function shapeWhileDrawing(draft: WorkDraft, hover: LayoutPoint | null, label: string, isValid: boolean): DraftShape[] {
	if (draft.kind === 'reshape_shoreline') return [{ kind: 'polygon', points: draft.outline, label, isValid }];
	if (!isPointsDraft(draft)) return [];
	const shape = drawnShapeOf(draft);
	const end = rubberBandEndFor(shape, draft.points, hover);
	const isSnapped = isOnFinishHandle(shape, draft.points, hover);
	return [
		{
			kind: shape,
			points: end ? [...draft.points, end] : draft.points,
			label: isSnapped ? `${label}${ClickToFinishCue}` : label,
			isValid: isValid || pointsStillNeeded(draft) > 0,
			isBeingDrawn: true,
			handles: handlesWhileDrawing(shape, draft.points, hover)
		}
	];
}
