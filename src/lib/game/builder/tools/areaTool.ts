import { isAreaDraft, type AreaDraft } from '$lib/domain/groundworks/draftFootprint';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { sceneDistance } from '../sceneDistance';
import type { ToolHandlers } from './toolHandlers';

export const ClosingClickRadius = 16;
const MinimumPolygonPoints = 3;

export function areaTool(createDraft: (points: LayoutPoint[]) => AreaDraft): ToolHandlers {
	return {
		onClick(builder, point) {
			const draft = builder.draft;
			if (!builder.isDrawing || !draft || !isAreaDraft(draft)) return builder.startDrawing(createDraft([point]));
			if (isClosingClick(draft.points, point)) return builder.place(draft);
			builder.draft = { ...draft, points: [...draft.points, point] };
		}
	};
}

export function isClosingClick(points: LayoutPoint[], point: LayoutPoint) {
	return points.length >= MinimumPolygonPoints && sceneDistance(points[0], point) <= ClosingClickRadius;
}
