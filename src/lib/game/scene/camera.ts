import { SceneSize } from './palette';
import type { Point } from './lakeShape';

export type ViewMode = 'birdseye' | 'swim';

export interface Camera {
	scale: number;
	origin: Point;
}

const SwimViewScale = 2.2;
const SwimViewLeanTowardsWater = 0.3;
const CameraEase = 0.12;

export const BirdseyeCamera: Camera = { scale: 1, origin: { x: 0, y: 0 } };

export function cameraFor(mode: ViewMode, swimPoint: Point | null, lakeCentre: Point): Camera {
	if (mode === 'birdseye' || !swimPoint) return BirdseyeCamera;
	const focus = {
		x: swimPoint.x + (lakeCentre.x - swimPoint.x) * SwimViewLeanTowardsWater,
		y: swimPoint.y + (lakeCentre.y - swimPoint.y) * SwimViewLeanTowardsWater
	};
	return { scale: SwimViewScale, origin: clampOrigin(centredOrigin(focus, SwimViewScale), SwimViewScale) };
}

export function easeCamera(current: Camera, target: Camera): Camera {
	return {
		scale: current.scale + (target.scale - current.scale) * CameraEase,
		origin: { x: current.origin.x + (target.origin.x - current.origin.x) * CameraEase, y: current.origin.y + (target.origin.y - current.origin.y) * CameraEase }
	};
}

export function applyCamera(context: CanvasRenderingContext2D, camera: Camera) {
	context.scale(camera.scale, camera.scale);
	context.translate(-camera.origin.x, -camera.origin.y);
}

export function toWorldPoint(camera: Camera, viewportPoint: Point): Point {
	return { x: camera.origin.x + viewportPoint.x / camera.scale, y: camera.origin.y + viewportPoint.y / camera.scale };
}

function centredOrigin(focus: Point, scale: number): Point {
	return { x: focus.x - SceneSize.Width / scale / 2, y: focus.y - SceneSize.Height / scale / 2 };
}

function clampOrigin(origin: Point, scale: number): Point {
	return {
		x: Math.min(SceneSize.Width - SceneSize.Width / scale, Math.max(0, origin.x)),
		y: Math.min(SceneSize.Height - SceneSize.Height / scale, Math.max(0, origin.y))
	};
}
