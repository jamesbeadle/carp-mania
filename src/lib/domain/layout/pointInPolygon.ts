import type { LayoutPoint } from './layoutTypes';

export function isPointInPolygon(point: LayoutPoint, polygon: LayoutPoint[]) {
	let isInside = false;
	for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
		const current = polygon[index];
		const before = polygon[previous];
		const crossesRay = current.y > point.y !== before.y > point.y;
		if (!crossesRay) continue;
		const crossingX = ((before.x - current.x) * (point.y - current.y)) / (before.y - current.y) + current.x;
		if (point.x < crossingX) isInside = !isInside;
	}
	return isInside;
}

export function isPolygonInsidePolygon(inner: LayoutPoint[], outer: LayoutPoint[]) {
	return inner.every((point) => isPointInPolygon(point, outer));
}

export function doPolygonsOverlap(first: LayoutPoint[], second: LayoutPoint[]) {
	return first.some((point) => isPointInPolygon(point, second)) || second.some((point) => isPointInPolygon(point, first));
}
