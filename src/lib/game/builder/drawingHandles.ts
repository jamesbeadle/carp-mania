import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { FinishHandleRadius, type DraftHandle } from '../render/drawDraftHandles';
import { sceneDistance } from './sceneDistance';

export type DrawnShape = 'polygon' | 'polyline';

export const MinimumPointsFor: Record<DrawnShape, number> = { polygon: 3, polyline: 2 };

export function finishHandleOf(shape: DrawnShape, placed: LayoutPoint[]): LayoutPoint | null {
	if (placed.length < MinimumPointsFor[shape]) return null;
	return shape === 'polygon' ? placed[0] : placed[placed.length - 1];
}

export function isOnFinishHandle(shape: DrawnShape, placed: LayoutPoint[], point: LayoutPoint | null) {
	const handle = finishHandleOf(shape, placed);
	return handle !== null && point !== null && sceneDistance(handle, point) <= FinishHandleRadius;
}

export function handlesWhileDrawing(shape: DrawnShape, placed: LayoutPoint[], hover: LayoutPoint | null): DraftHandle[] {
	const vertices: DraftHandle[] = placed.map((point) => ({ point, role: 'vertex', isSnapped: false }));
	const finish = finishHandleOf(shape, placed);
	if (!finish) return vertices;
	return [...vertices, { point: finish, role: 'finish', isSnapped: isOnFinishHandle(shape, placed, hover) }];
}

export function rubberBandEndFor(shape: DrawnShape, placed: LayoutPoint[], hover: LayoutPoint | null): LayoutPoint | null {
	if (!hover) return null;
	return isOnFinishHandle(shape, placed, hover) ? finishHandleOf(shape, placed) : hover;
}
