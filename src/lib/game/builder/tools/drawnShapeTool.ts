import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { isOnFinishHandle } from '../drawingHandles';
import { drawnShapeOf, finishDrawing, isPointsDraft, type PointsDraft } from '../finishDrawing';
import type { ToolHandlers } from './toolHandlers';

export function drawnShapeTool(createDraft: (points: LayoutPoint[]) => PointsDraft): ToolHandlers {
	return {
		onClick(builder, point) {
			const draft = builder.draft;
			if (!builder.isDrawing || !draft || !isPointsDraft(draft)) return builder.startDrawing(createDraft([point]));
			if (isOnFinishHandle(drawnShapeOf(draft), draft.points, point)) return finishDrawing(builder);
			builder.draft = { ...draft, points: [...draft.points, point] };
		},
		onDoubleClick: finishDrawing
	};
}
