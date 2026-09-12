export interface CanvasPointer {
	id: number;
	x: number;
	y: number;
	at: number;
}

export type PointerIntent =
	| { kind: 'rotate'; deltaX: number; deltaY: number; secondsSinceLastMove: number }
	| { kind: 'pinch'; factor: number }
	| { kind: 'hover'; x: number; y: number }
	| { kind: 'click'; x: number; y: number }
	| { kind: 'release'; secondsSinceLastMove: number }
	| { kind: 'none' };

const ClickTolerancePx = 4;
const PinchPointerCount = 2;
const MillisecondsPerSecond = 1000;

export class PointerTracker {
	private readonly pointers = new Map<number, CanvasPointer>();
	private pressedAt: CanvasPointer | null = null;
	private lastPinchDistance = 0;
	isDragging = false;

	get isPressed() {
		return this.pointers.size > 0;
	}

	down(pointer: CanvasPointer) {
		this.pointers.set(pointer.id, pointer);
		if (this.pointers.size === 1) this.beginPress(pointer);
		if (this.pointers.size === PinchPointerCount) this.lastPinchDistance = this.pinchDistance();
	}

	move(pointer: CanvasPointer): PointerIntent {
		const previous = this.pointers.get(pointer.id);
		if (!previous) return { kind: 'hover', x: pointer.x, y: pointer.y };
		this.pointers.set(pointer.id, pointer);
		if (this.pointers.size >= PinchPointerCount) return this.pinch();
		if (!this.isDragging && !this.hasLeftClickTolerance(pointer)) return { kind: 'none' };
		this.isDragging = true;
		return { kind: 'rotate', deltaX: pointer.x - previous.x, deltaY: pointer.y - previous.y, secondsSinceLastMove: (pointer.at - previous.at) / MillisecondsPerSecond };
	}

	up(pointer: CanvasPointer): PointerIntent {
		const previous = this.pointers.get(pointer.id);
		const wasClick = this.pointers.size === 1 && !this.isDragging && previous !== undefined;
		const wasDragEnd = this.pointers.size === 1 && this.isDragging && previous !== undefined;
		this.pointers.delete(pointer.id);
		if (this.pointers.size === 0) this.isDragging = false;
		if (wasClick) return { kind: 'click', x: pointer.x, y: pointer.y };
		if (wasDragEnd) return { kind: 'release', secondsSinceLastMove: (pointer.at - previous.at) / MillisecondsPerSecond };
		return { kind: 'none' };
	}

	private beginPress(pointer: CanvasPointer) {
		this.pressedAt = pointer;
		this.isDragging = false;
	}

	private hasLeftClickTolerance(pointer: CanvasPointer) {
		if (!this.pressedAt) return true;
		return Math.hypot(pointer.x - this.pressedAt.x, pointer.y - this.pressedAt.y) > ClickTolerancePx;
	}

	private pinch(): PointerIntent {
		const distance = this.pinchDistance();
		const factor = this.lastPinchDistance > 0 ? distance / this.lastPinchDistance : 1;
		this.lastPinchDistance = distance;
		this.isDragging = true;
		return { kind: 'pinch', factor };
	}

	private pinchDistance() {
		const [first, second] = [...this.pointers.values()];
		return Math.hypot(first.x - second.x, first.y - second.y);
	}
}
