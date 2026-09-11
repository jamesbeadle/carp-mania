import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { sceneDistance } from './sceneDistance';

const DragStartsAfterScenePixels = 6;

export interface PointerGestureHandlers {
	onHover: (point: LayoutPoint | null) => void;
	onClick: (point: LayoutPoint) => void;
	onDoubleClick: (point: LayoutPoint) => void;
	onDragStart: (point: LayoutPoint) => void;
	onDrag: (point: LayoutPoint) => void;
	onDragEnd: (point: LayoutPoint) => void;
}

export function createPointerGestures(handlers: PointerGestureHandlers) {
	let pressedAt: LayoutPoint | null = null;
	let isDragging = false;

	function move(point: LayoutPoint) {
		handlers.onHover(point);
		if (!pressedAt) return;
		const isStillAClick = !isDragging && sceneDistance(pressedAt, point) < DragStartsAfterScenePixels;
		if (isStillAClick) return;
		if (!isDragging) {
			isDragging = true;
			handlers.onDragStart(pressedAt);
		}
		handlers.onDrag(point);
	}

	function up(point: LayoutPoint) {
		if (!pressedAt) return;
		const finish = isDragging ? handlers.onDragEnd : handlers.onClick;
		finish(point);
		pressedAt = null;
		isDragging = false;
	}

	return {
		down(point: LayoutPoint) {
			pressedAt = point;
			isDragging = false;
		},
		move,
		up,
		leave() {
			pressedAt = null;
			isDragging = false;
			handlers.onHover(null);
		},
		doubleClick: handlers.onDoubleClick
	};
}
