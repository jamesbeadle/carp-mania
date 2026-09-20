import { CameraLimits, viewToScene } from './camera';
import type { CameraState } from './cameraState.svelte';
import type { Point } from './lakeShape';
import { toScenePoint } from './renderLoop';

const DragStartsAfterScenePixels = 6;
const Halfway = 2;

interface Touch {
	id: number;
	view: Point;
}

function distanceBetween(first: Point, second: Point) {
	const across = first.x - second.x;
	const down = first.y - second.y;
	return Math.hypot(across, down);
}

function midpointOf(first: Point, second: Point): Point {
	const x = (first.x + second.x) / Halfway;
	const y = (first.y + second.y) / Halfway;
	return { x, y };
}

export class CameraGestures {
	private touches: Touch[] = [];
	private hasPanned = false;
	private lastPinchSpan: number | null = null;

	constructor(private readonly camera: CameraState, private readonly canvas: () => HTMLCanvasElement) {}

	wheel(event: WheelEvent) {
		event.preventDefault();
		const factor = event.deltaY < 0 ? CameraLimits.WheelStep : 1 / CameraLimits.WheelStep;
		const camera = this.camera;
		camera.zoomAround(factor, camera.scenePointOf(this.canvas(), event.clientX, event.clientY));
	}

	down(event: PointerEvent) {
		const pointerId = event.pointerId;
		const others = this.touches.filter((touch) => touch.id !== pointerId);
		this.touches = [...others, { id: pointerId, view: this.viewOf(event) }];
		this.hasPanned = false;
		this.lastPinchSpan = null;
	}

	move(event: PointerEvent) {
		const touch = this.touchFor(event);
		if (!touch) return false;
		const view = this.viewOf(event);
		const isPinching = this.touches.length >= 2;
		if (isPinching) this.pinch(touch, view);
		if (!isPinching) this.drag(touch, view);
		touch.view = view;
		return this.hasPanned;
	}

	up(event: PointerEvent) {
		const pointerId = event.pointerId;
		this.touches = this.touches.filter((touch) => touch.id !== pointerId);
		const wasADrag = this.hasPanned;
		if (this.touches.length === 0) this.hasPanned = false;
		return wasADrag;
	}

	private touchFor(event: PointerEvent) {
		const pointerId = event.pointerId;
		return this.touches.find((candidate) => candidate.id === pointerId) ?? null;
	}

	private drag(touch: Touch, view: Point) {
		const camera = this.camera;
		const isZoomedIn = camera.zoom > CameraLimits.LeastZoom;
		const isStillAClick = !this.hasPanned && distanceBetween(view, touch.view) < DragStartsAfterScenePixels;
		if (!isZoomedIn || isStillAClick) return;
		this.hasPanned = true;
		const from = touch.view;
		camera.panBy((view.x - from.x) / camera.zoom, (view.y - from.y) / camera.zoom);
	}

	private pinch(touch: Touch, view: Point) {
		const touchId = touch.id;
		const other = this.touches.find((candidate) => candidate.id !== touchId);
		if (!other) return;
		const span = distanceBetween(view, other.view);
		const middle = viewToScene(this.camera.camera, midpointOf(view, other.view));
		const lastSpan = this.lastPinchSpan;
		if (lastSpan !== null && lastSpan > 0) this.camera.zoomAround(span / lastSpan, middle);
		this.lastPinchSpan = span;
		this.hasPanned = true;
	}

	private viewOf(event: PointerEvent) {
		return toScenePoint(this.canvas(), event.clientX, event.clientY);
	}
}
