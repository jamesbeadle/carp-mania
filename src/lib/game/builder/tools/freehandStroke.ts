import { MaximumPointsPerDraft } from '$lib/domain/groundworks/isWorkDraft';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { BuilderState } from '../builderState.svelte';
import { finishDrawing, isPointsDraft, type PointsDraft } from '../finishDrawing';
import { sceneDistance } from '../sceneDistance';
import type { ToolHandlers } from './toolHandlers';

const ScenePixelsBetweenTracedPoints = 12;

function traceTo(builder: BuilderState, point: LayoutPoint) {
	const draft = builder.draft;
	if (!builder.isDrawing || !draft || !isPointsDraft(draft)) return;
	const { points } = draft;
	const last = points[points.length - 1];
	const isFarEnough = sceneDistance(last, point) >= ScenePixelsBetweenTracedPoints;
	const hasRoom = points.length < MaximumPointsPerDraft;
	if (isFarEnough && hasRoom) builder.draft = { ...draft, points: [...points, point] };
}

export function freehandStroke(createDraft: (points: LayoutPoint[]) => PointsDraft): ToolHandlers {
	return {
		onDragStart(builder, point) {
			const isStartingAShape = !builder.isDrawing;
			if (isStartingAShape) {
				builder.startDrawing(createDraft([point]));
			}
			traceTo(builder, point);
		},
		onDrag: traceTo,
		onDragEnd(builder, point) {
			traceTo(builder, point);
			finishDrawing(builder);
		}
	};
}
