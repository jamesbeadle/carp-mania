import { Shape, Vector2 } from 'three';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { worldPointOf, type LakeFrame, type WorldPoint } from './lakeFrame';
import { smoothOutline } from './smoothOutline';

export function planeVectorOf(point: WorldPoint) {
	return new Vector2(point.x, -point.z);
}

export function smoothWorldOutline(frame: LakeFrame, fractions: LayoutPoint[]): WorldPoint[] {
	return smoothOutline(fractions).map((fraction) => worldPointOf(frame, fraction));
}

export function shapeOf(points: WorldPoint[]) {
	return new Shape(points.map(planeVectorOf));
}

export function shapeWithHoles(outer: WorldPoint[], holes: WorldPoint[][]) {
	const shape = shapeOf(outer);
	shape.holes = holes.map(shapeOf);
	return shape;
}
