import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { sceneDistance } from './sceneDistance';

const DragStartsAfterScenePixels = 6;
const DoubleTap = { WithinMilliseconds: 300, WithinScenePixels: 14 } as const;

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
	let lastTapAt: LayoutPoint | null = null;
	let lastTapMilliseconds = 0;

	function move(point: LayoutPoint) {
		handlers.onHover(point);
		if (!pressedAt) return;
		const isStillAClick = !isDragging && sceneDistance(pressedAt, point) < DragStartsAfterScenePixels;
		if (isStillAClick) return;
		if (!isDragging) {
			isDragging = true;
			lastTapAt = null;
			handlers.onDragStart(pressedAt);
		}
		handlers.onDrag(point);
	}

	function up(point: LayoutPoint, nowMilliseconds = performance.now()) {
		if (!pressedAt) return;
		if (isDragging) handlers.onDragEnd(point);
		if (!isDragging) tap(point, nowMilliseconds);
		pressedAt = null;
		isDragging = false;
	}

	function tap(point: LayoutPoint, nowMilliseconds: number) {
		const isSecondTap = lastTapAt !== null && nowMilliseconds - lastTapMilliseconds <= DoubleTap.WithinMilliseconds && sceneDistance(lastTapAt, point) <= DoubleTap.WithinScenePixels;
		lastTapAt = isSecondTap ? null : point;
		lastTapMilliseconds = nowMilliseconds;
		if (isSecondTap) return handlers.onDoubleClick(point);
		handlers.onClick(point);
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
			lastTapAt = null;
			handlers.onHover(null);
		}
	};
}
