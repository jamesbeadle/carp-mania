import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { toScene, type Point } from '../scene/lakeShape';

export type HandleRole = 'vertex' | 'finish';

export interface DraftHandle {
	point: LayoutPoint;
	role: HandleRole;
	isSnapped: boolean;
}

export const FinishHandleRadius = 20;
const Handle = { VertexRadius: 4, RingWidth: 2, SnappedRingWidth: 4, RingFillAlpha: 0.18, SnappedFillAlpha: 0.5 } as const;

export function drawDraftHandles(context: CanvasRenderingContext2D, handles: DraftHandle[], colour: string) {
	context.save();
	context.setLineDash([]);
	context.strokeStyle = colour;
	context.fillStyle = colour;
	for (const handle of handles) drawHandle(context, handle, colour);
	context.restore();
}

function drawHandle(context: CanvasRenderingContext2D, handle: DraftHandle, colour: string) {
	const centre = toScene(handle.point);
	if (handle.role === 'finish') drawFinishRing(context, centre, handle.isSnapped);
	drawVertexDot(context, centre, colour);
}

function drawFinishRing(context: CanvasRenderingContext2D, centre: Point, isSnapped: boolean) {
	context.lineWidth = isSnapped ? Handle.SnappedRingWidth : Handle.RingWidth;
	context.beginPath();
	context.arc(centre.x, centre.y, FinishHandleRadius, 0, Math.PI * 2);
	context.globalAlpha = isSnapped ? Handle.SnappedFillAlpha : Handle.RingFillAlpha;
	context.fill();
	context.globalAlpha = 1;
	context.stroke();
}

function drawVertexDot(context: CanvasRenderingContext2D, centre: Point, colour: string) {
	context.fillStyle = colour;
	context.beginPath();
	context.arc(centre.x, centre.y, Handle.VertexRadius, 0, Math.PI * 2);
	context.fill();
}
