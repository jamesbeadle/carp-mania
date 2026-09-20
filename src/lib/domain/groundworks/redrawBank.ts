import type { LayoutPoint } from '../layout/layoutTypes';
import { polygonCentroid } from '../layout/polygonArea';
import { outlineWithAnchors, type BankAnchor, type SceneDistance } from './bankAnchor';
import { roundedStretch, softenedPath } from './roundedBank';

export function redrawBank(outline: LayoutPoint[], from: BankAnchor, path: LayoutPoint[], to: BankAnchor, distance: SceneDistance): LayoutPoint[] {
	const { vertices, anchorIndices } = outlineWithAnchors(outline, [from, to]);
	const [fromIndex, toIndex] = anchorIndices;
	const startingAtFrom = [...vertices.slice(fromIndex), ...vertices.slice(0, fromIndex)];
	const toPosition = (toIndex - fromIndex + vertices.length) % vertices.length;
	const forward = startingAtFrom.slice(1, toPosition);
	const backward = startingAtFrom.slice(toPosition + 1);
	const isForwardShorter = pathLength([from.point, ...forward, to.point], distance) <= pathLength([to.point, ...backward, from.point], distance);
	const removed = isForwardShorter ? forward : [...backward].reverse();
	const newStretch = path.length > 0 ? softenedPath(from.point, path, to.point) : roundedStretch(from.point, to.point, removed, polygonCentroid(outline), distance);
	if (isForwardShorter) return [from.point, ...newStretch, to.point, ...backward];
	return [from.point, ...forward, to.point, ...[...newStretch].reverse()];
}

function pathLength(points: LayoutPoint[], distance: SceneDistance) {
	let total = 0;
	for (let index = 1; index < points.length; index++) total += distance(points[index - 1], points[index]);
	return total;
}
