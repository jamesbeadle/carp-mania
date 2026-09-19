import type { LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { lakeCentroid } from '$lib/domain/layout/waterArea';
import { SceneSize } from './palette';

export interface Point {
	x: number;
	y: number;
}

const MinimumPolygonPoints = 3;

export function toScene(fraction: LayoutPoint): Point {
	return { x: fraction.x * SceneSize.Width, y: fraction.y * SceneSize.Height };
}

export function distanceBetween(first: Point, second: Point) {
	const across = first.x - second.x;
	const down = first.y - second.y;
	return Math.hypot(across, down);
}

export function toFraction(point: Point): LayoutPoint {
	return { x: point.x / SceneSize.Width, y: point.y / SceneSize.Height };
}

export function smoothClosedPath(points: Point[]): Path2D {
	const path = new Path2D();
	if (points.length < MinimumPolygonPoints) return path;
	const count = points.length;
	const midpoint = (first: Point, second: Point) => ({ x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 });
	const start = midpoint(points[0], points[1]);
	path.moveTo(start.x, start.y);
	for (let index = 1; index <= count; index++) {
		const control = points[index % count];
		const next = midpoint(control, points[(index + 1) % count]);
		path.quadraticCurveTo(control.x, control.y, next.x, next.y);
	}
	path.closePath();
	return path;
}

export function scenePathOf(fractions: LayoutPoint[]): Path2D {
	return smoothClosedPath(fractions.map(toScene));
}

export function lakePathFrom(layout: LakeLayout): Path2D {
	return scenePathOf(layout.outline);
}

export function islandPathsFrom(layout: LakeLayout): Path2D[] {
	return layout.islands.map((island) => scenePathOf(island.points));
}

export function lakeCentreOf(layout: LakeLayout): Point {
	if (layout.outline.length === 0) return { x: SceneSize.Width / 2, y: SceneSize.Height / 2 };
	return toScene(lakeCentroid(layout));
}

export function isPointInScenePath(context: CanvasRenderingContext2D, path: Path2D, point: Point) {
	context.save();
	context.setTransform(1, 0, 0, 1, 0, 0);
	const isInside = context.isPointInPath(path, point.x, point.y);
	context.restore();
	return isInside;
}

export function isInsideWater(context: CanvasRenderingContext2D, lake: Path2D, islands: Path2D[], point: Point) {
	if (!isPointInScenePath(context, lake, point)) return false;
	return !islands.some((island) => isPointInScenePath(context, island, point));
}
