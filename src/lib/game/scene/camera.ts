import type { Point } from './lakeShape';
import { SceneSize } from './palette';

export interface Camera {
	zoom: number;
	centre: Point;
}

export const CameraLimits = { LeastZoom: 1, MostZoom: 8, ZoomFromAcres: 30, ClusterBelowPixels: 24, WheelStep: 1.15, ClickIntoClusterZoom: 2 } as const;

const Half = 2;
const SceneCentre: Point = { x: SceneSize.Width / Half, y: SceneSize.Height / Half };

export function fittedCamera(): Camera {
	return { zoom: CameraLimits.LeastZoom, centre: SceneCentre };
}

export function isZoomable(plotAcres: number) {
	return plotAcres >= CameraLimits.ZoomFromAcres;
}

function between(lowest: number, value: number, highest: number) {
	return Math.min(highest, Math.max(lowest, value));
}

function clampedZoom(zoom: number) {
	return between(CameraLimits.LeastZoom, zoom, CameraLimits.MostZoom);
}

export function clampCamera(camera: Camera): Camera {
	const zoom = clampedZoom(camera.zoom);
	const halfWidth = SceneSize.Width / (Half * zoom);
	const halfHeight = SceneSize.Height / (Half * zoom);
	const { x, y } = camera.centre;
	return { zoom, centre: { x: between(halfWidth, x, SceneSize.Width - halfWidth), y: between(halfHeight, y, SceneSize.Height - halfHeight) } };
}

export function zoomedAround(camera: Camera, factor: number, around: Point): Camera {
	const zoom = clampedZoom(camera.zoom * factor);
	const change = camera.zoom / zoom;
	const { x, y } = camera.centre;
	const centre = { x: pulledTowards(around.x, x, change), y: pulledTowards(around.y, y, change) };
	return clampCamera({ zoom, centre });
}

function pulledTowards(anchor: number, value: number, change: number) {
	return anchor - (anchor - value) * change;
}

export function pannedBy(camera: Camera, sceneDeltaX: number, sceneDeltaY: number): Camera {
	const { x, y } = camera.centre;
	return clampCamera({ zoom: camera.zoom, centre: { x: x - sceneDeltaX, y: y - sceneDeltaY } });
}

export function centredOn(camera: Camera, point: Point): Camera {
	return clampCamera({ zoom: camera.zoom, centre: point });
}

export function viewToScene(camera: Camera, view: Point): Point {
	const { x, y } = camera.centre;
	const { zoom } = camera;
	const across = (view.x - SceneCentre.x) / zoom;
	const down = (view.y - SceneCentre.y) / zoom;
	return { x: across + x, y: down + y };
}

export function sceneToView(camera: Camera, scene: Point): Point {
	const { x, y } = camera.centre;
	const { zoom } = camera;
	const across = (scene.x - x) * zoom;
	const down = (scene.y - y) * zoom;
	return { x: across + SceneCentre.x, y: down + SceneCentre.y };
}

export function applyCamera(context: CanvasRenderingContext2D, camera: Camera, displayWidth: number, displayHeight: number) {
	const fitX = displayWidth / SceneSize.Width;
	const fitY = displayHeight / SceneSize.Height;
	const { x, y } = camera.centre;
	const { zoom } = camera;
	const offsetX = fitX * (SceneCentre.x - x * zoom);
	const offsetY = fitY * (SceneCentre.y - y * zoom);
	context.setTransform(fitX * zoom, 0, 0, fitY * zoom, offsetX, offsetY);
}

export function viewportOf(camera: Camera) {
	const width = SceneSize.Width / camera.zoom;
	const height = SceneSize.Height / camera.zoom;
	const { x, y } = camera.centre;
	return { x: x - width / Half, y: y - height / Half, width, height };
}
