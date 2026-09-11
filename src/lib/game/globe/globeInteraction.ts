import type { WorldPin } from '$lib/contracts/WorldPin';
import { clusterCentre } from './clusterPins';
import { wheelZoomFactor } from './globeInput';
import { PointerTracker, type CanvasPointer, type PointerIntent } from './globePointer';
import type { GlobeState } from './globeState.svelte';
import { markerAt } from './hitTest';

export interface GlobeListeners {
	onPinClick?: (pin: WorldPin) => void;
	onPinHover?: (pin: WorldPin | null) => void;
	onGlobeClick?: (latitude: number, longitude: number) => void;
}

const ClusterZoomInFactor = 2;
const DoubleClickZoom = 3;
const RestingBeforeReleaseSeconds = 0.08;

export class GlobeInteraction {
	private readonly globe: GlobeState;
	private readonly listeners: () => GlobeListeners;
	private readonly pointer = new PointerTracker();
	private canvas: HTMLCanvasElement | null = null;

	constructor(globe: GlobeState, listeners: () => GlobeListeners) {
		this.globe = globe;
		this.listeners = listeners;
	}

	attachTo(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
	}

	get isDragging() {
		return this.pointer.isDragging;
	}

	pointerDown(event: PointerEvent) {
		this.canvas?.setPointerCapture(event.pointerId);
		this.globe.holdStill();
		this.pointer.down(this.canvasPointerOf(event));
	}

	pointerMove(event: PointerEvent) {
		this.act(this.pointer.move(this.canvasPointerOf(event)));
	}

	pointerUp(event: PointerEvent) {
		this.act(this.pointer.up(this.canvasPointerOf(event)));
	}

	pointerLeave() {
		if (!this.pointer.isPressed) this.hover(null);
	}

	wheel(event: WheelEvent) {
		event.preventDefault();
		this.globe.zoomBy(wheelZoomFactor(event));
	}

	doubleClick(event: MouseEvent) {
		const { x, y } = this.canvasPointerOf(event);
		const marker = markerAt(this.globe.markers, x, y);
		if (marker?.kind === 'pin') this.globe.flyTo(marker.pin, Math.max(this.globe.view.zoom, DoubleClickZoom));
	}

	private act(intent: PointerIntent) {
		if (intent.kind === 'rotate') return this.globe.rotateBy(intent.deltaX, intent.deltaY, intent.secondsSinceLastMove);
		if (intent.kind === 'pinch') return this.globe.zoomBy(intent.factor);
		if (intent.kind === 'hover') return this.hoverAt(intent.x, intent.y);
		if (intent.kind === 'click') return this.clickAt(intent.x, intent.y);
		if (intent.kind === 'release' && intent.secondsSinceLastMove > RestingBeforeReleaseSeconds) return this.globe.holdStill();
	}

	private hoverAt(x: number, y: number) {
		const marker = markerAt(this.globe.markers, x, y);
		this.hover(marker?.kind === 'pin' ? marker.pin : null);
	}

	private hover(pin: WorldPin | null) {
		const pinId = pin?.id ?? null;
		if (pinId === this.globe.hoveredPinId) return;
		this.globe.hoveredPinId = pinId;
		this.listeners().onPinHover?.(pin);
	}

	private clickAt(x: number, y: number) {
		const marker = markerAt(this.globe.markers, x, y);
		if (marker?.kind === 'pin') return this.listeners().onPinClick?.(marker.pin);
		if (marker?.kind === 'cluster') return this.globe.flyTo(clusterCentre(marker), this.globe.view.zoom * ClusterZoomInFactor);
		const point = this.globe.pointAt(x, y);
		if (point) this.listeners().onGlobeClick?.(point.latitude, point.longitude);
	}

	private canvasPointerOf(event: PointerEvent | MouseEvent): CanvasPointer {
		const bounds = this.canvas?.getBoundingClientRect() ?? { left: 0, top: 0 };
		const id = 'pointerId' in event ? event.pointerId : 0;
		return { id, x: event.clientX - bounds.left, y: event.clientY - bounds.top, at: event.timeStamp };
	}
}
