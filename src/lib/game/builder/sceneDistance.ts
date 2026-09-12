import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { Swim } from '$lib/domain/types';
import { SwimPegRadius } from '../render/drawSwims';
import { toScene } from '../scene/lakeShape';

const SwimHitRadius = SwimPegRadius * 1.4;

export function sceneDistance(first: LayoutPoint, second: LayoutPoint) {
	const firstScene = toScene(first);
	const secondScene = toScene(second);
	return Math.hypot(firstScene.x - secondScene.x, firstScene.y - secondScene.y);
}

export function swimAt(swims: Swim[], point: LayoutPoint) {
	return swims.find((swim) => sceneDistance({ x: Number(swim.position_x), y: Number(swim.position_y) }, point) <= SwimHitRadius) ?? null;
}

export function nearestVertex(polygon: LayoutPoint[], point: LayoutPoint, withinScenePixels: number): number | null {
	let nearestIndex: number | null = null;
	let nearestDistance = withinScenePixels;
	for (let index = 0; index < polygon.length; index++) {
		const distance = sceneDistance(polygon[index], point);
		if (distance > nearestDistance) continue;
		nearestDistance = distance;
		nearestIndex = index;
	}
	return nearestIndex;
}

export function clampToScene(point: LayoutPoint): LayoutPoint {
	return { x: Math.min(1, Math.max(0, point.x)), y: Math.min(1, Math.max(0, point.y)) };
}
