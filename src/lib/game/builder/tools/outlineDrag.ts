import { closestPointOnSegment } from '$lib/domain/layout/distanceToEdge';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { BuilderState } from '../builderState.svelte';
import { clampToScene, nearestVertex, sceneDistance } from '../sceneDistance';
import type { ToolContext } from './toolHandlers';

export const VertexGrabRadius = 18;

export function currentOutline(builder: BuilderState, context: ToolContext): LayoutPoint[] {
	const draft = builder.draft;
	return draft?.kind === 'reshape_shoreline' ? draft.outline : context.layout.outline;
}

export function grabVertex(builder: BuilderState, point: LayoutPoint, context: ToolContext) {
	builder.draggedVertex = nearestVertex(currentOutline(builder, context), point, VertexGrabRadius);
}

export function pullOutVertex(builder: BuilderState, point: LayoutPoint, context: ToolContext) {
	const outline = currentOutline(builder, context);
	const index = nearestEdgeIndex(outline, point);
	const inserted = [...outline.slice(0, index + 1), closestPointOnSegment(point, outline[index], outline[(index + 1) % outline.length]), ...outline.slice(index + 1)];
	builder.startDrawing({ kind: 'reshape_shoreline', outline: inserted });
	builder.draggedVertex = index + 1;
}

export function dragVertex(builder: BuilderState, point: LayoutPoint, context: ToolContext) {
	const index = builder.draggedVertex;
	if (index === null) return;
	const outline = currentOutline(builder, context).map((vertex, candidate) => (candidate === index ? clampToScene(point) : vertex));
	builder.startDrawing({ kind: 'reshape_shoreline', outline });
}

export function releaseVertex(builder: BuilderState, point: LayoutPoint, context: ToolContext) {
	dragVertex(builder, point, context);
	builder.draggedVertex = null;
	const draft = builder.draft;
	if (draft) builder.place(draft);
}

function nearestEdgeIndex(outline: LayoutPoint[], point: LayoutPoint) {
	let nearestIndex = 0;
	let nearestDistance = Number.POSITIVE_INFINITY;
	for (let index = 0; index < outline.length; index++) {
		const distance = sceneDistance(point, closestPointOnSegment(point, outline[index], outline[(index + 1) % outline.length]));
		if (distance >= nearestDistance) continue;
		nearestDistance = distance;
		nearestIndex = index;
	}
	return nearestIndex;
}
