import { SceneSize } from './palette';

export interface Point {
	x: number;
	y: number;
}

const LakeOutlineFractions: Point[] = [
	{ x: 0.12, y: 0.3 }, { x: 0.22, y: 0.16 }, { x: 0.4, y: 0.12 }, { x: 0.6, y: 0.18 }, { x: 0.8, y: 0.14 },
	{ x: 0.93, y: 0.3 }, { x: 0.9, y: 0.52 }, { x: 0.94, y: 0.72 }, { x: 0.8, y: 0.86 }, { x: 0.6, y: 0.84 },
	{ x: 0.45, y: 0.92 }, { x: 0.26, y: 0.86 }, { x: 0.12, y: 0.72 }, { x: 0.06, y: 0.52 }
];

const IslandOutlineFractions: Point[] = [
	{ x: 0.58, y: 0.36 }, { x: 0.66, y: 0.33 }, { x: 0.72, y: 0.4 }, { x: 0.68, y: 0.48 }, { x: 0.6, y: 0.47 }
];

export function toScene(fraction: Point): Point {
	return { x: fraction.x * SceneSize.Width, y: fraction.y * SceneSize.Height };
}

export function smoothClosedPath(points: Point[]): Path2D {
	const path = new Path2D();
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

export const LakePath = () => smoothClosedPath(LakeOutlineFractions.map(toScene));
export const IslandPath = () => smoothClosedPath(IslandOutlineFractions.map(toScene));

export function lakeCentre(): Point {
	return { x: SceneSize.Width * 0.5, y: SceneSize.Height * 0.5 };
}

export function isPointInScenePath(context: CanvasRenderingContext2D, path: Path2D, point: Point) {
	context.save();
	context.setTransform(1, 0, 0, 1, 0, 0);
	const isInside = context.isPointInPath(path, point.x, point.y);
	context.restore();
	return isInside;
}

export function isInsideWater(context: CanvasRenderingContext2D, lake: Path2D, island: Path2D, point: Point) {
	return isPointInScenePath(context, lake, point) && !isPointInScenePath(context, island, point);
}
