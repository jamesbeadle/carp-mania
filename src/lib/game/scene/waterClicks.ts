import type { Lake, Swim } from '$lib/domain/types';
import { SwimPegRadius, swimScenePoint } from '../render/drawSwims';
import { CameraLimits } from './camera';
import type { CameraState } from './cameraState.svelte';
import { isCastClearOfIslands, isPointInWater } from './castClearance';
import { clusterAt, clusterSwims } from './clusterSwims';
import { distanceBetween, type Point } from './lakeShape';

export const SwimHitRadius = SwimPegRadius * 1.4;

export interface WaterClickHandlers {
	onSwimClick?: (swim: Swim) => void;
	onWaterClick?: (point: Point) => void;
	onBankClick?: (point: Point) => void;
	onCastBlockedByIsland?: () => void;
}

export interface WaterUnderTheCanvas {
	lake: Lake;
	swims: Swim[];
	selectedSwim: Swim | null;
	camera: CameraState;
	canvas: HTMLCanvasElement;
}

export function swimAt(swims: Swim[], point: Point) {
	return swims.find((swim) => distanceBetween(swimScenePoint(swim), point) <= SwimHitRadius) ?? null;
}

export function answerTheClick(water: WaterUnderTheCanvas, point: Point, handlers: WaterClickHandlers) {
	const { lake, swims, selectedSwim, camera, canvas } = water;
	const cluster = clusterAt(clusterSwims(swims, camera.pixelsPerScenePixel(canvas)), point, SwimHitRadius / camera.zoom);
	if (cluster) return camera.zoomAround(CameraLimits.ClickIntoClusterZoom, cluster.centre);
	const swim = swimAt(swims, point);
	if (swim) return handlers.onSwimClick?.(swim);
	const context = canvas.getContext('2d');
	if (!context) return;
	if (!isPointInWater(context, lake.layout, point)) return handlers.onBankClick?.(point);
	const isBlocked = selectedSwim !== null && !isCastClearOfIslands(context, lake.layout, swimScenePoint(selectedSwim), point);
	if (isBlocked) return handlers.onCastBlockedByIsland?.();
	handlers.onWaterClick?.(point);
}
