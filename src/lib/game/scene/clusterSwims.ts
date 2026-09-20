import { CameraLimits } from './camera';
import type { Point } from './lakeShape';
import { SceneSize } from './palette';

interface Swim {
	id: string;
	position_x: number;
	position_y: number;
}

export interface SwimCluster<Peg extends Swim = Swim> {
	centre: Point;
	swims: Peg[];
}

function swimScenePoint(swim: Swim): Point {
	const x = Number(swim.position_x) * SceneSize.Width;
	const y = Number(swim.position_y) * SceneSize.Height;
	return { x, y };
}

export function clusterSwims<Peg extends Swim>(swims: Peg[], pixelsPerScenePixel: number): SwimCluster<Peg>[] {
	const cellScenePixels = CameraLimits.ClusterBelowPixels / Math.max(0.01, pixelsPerScenePixel);
	const cells = new Map<string, SwimCluster<Peg>>();
	for (const swim of swims) {
		const point = swimScenePoint(swim);
		const column = Math.floor(point.x / cellScenePixels);
		const row = Math.floor(point.y / cellScenePixels);
		const key = `${column}:${row}`;
		const cluster = cells.get(key) ?? { centre: point, swims: [] };
		cluster.swims.push(swim);
		cells.set(key, cluster);
	}
	return [...cells.values()].map(withCentre);
}

export function isClustered<Peg extends Swim>(cluster: SwimCluster<Peg>) {
	return cluster.swims.length > 1;
}

export function clusterAt<Peg extends Swim>(clusters: SwimCluster<Peg>[], point: Point, radius: number) {
	const isNear = (centre: Point) => distanceBetween(centre, point) <= radius;
	return clusters.filter(isClustered).find((cluster) => isNear(cluster.centre)) ?? null;
}

function distanceBetween(first: Point, second: Point) {
	const across = first.x - second.x;
	const down = first.y - second.y;
	return Math.hypot(across, down);
}

function withCentre<Peg extends Swim>(cluster: SwimCluster<Peg>): SwimCluster<Peg> {
	const points = cluster.swims.map(swimScenePoint);
	const count = points.length;
	const x = points.reduce((total, point) => total + point.x, 0) / count;
	const y = points.reduce((total, point) => total + point.y, 0) / count;
	return { centre: { x, y }, swims: cluster.swims };
}
