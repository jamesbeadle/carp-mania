import { closestPointOnSegment } from '../layout/distanceToEdge';
import type { LayoutPoint } from '../layout/layoutTypes';

export interface BankAnchor {
	edgeIndex: number;
	point: LayoutPoint;
}

export type SceneDistance = (first: LayoutPoint, second: LayoutPoint) => number;

export function anchorOnBank(outline: LayoutPoint[], point: LayoutPoint, withinScenePixels: number, distance: SceneDistance): BankAnchor | null {
	let nearest: BankAnchor | null = null;
	let nearestDistance = withinScenePixels;
	for (let edgeIndex = 0; edgeIndex < outline.length; edgeIndex++) {
		const onEdge = closestPointOnSegment(point, outline[edgeIndex], outline[(edgeIndex + 1) % outline.length]);
		const away = distance(point, onEdge);
		if (away > nearestDistance) continue;
		nearestDistance = away;
		nearest = { edgeIndex, point: onEdge };
	}
	return nearest;
}

export function outlineWithAnchors(outline: LayoutPoint[], anchors: BankAnchor[]): { vertices: LayoutPoint[]; anchorIndices: number[] } {
	const vertices: LayoutPoint[] = [];
	const anchorIndices = anchors.map(() => 0);
	for (let edgeIndex = 0; edgeIndex < outline.length; edgeIndex++) {
		vertices.push(outline[edgeIndex]);
		const onThisEdge = anchors.map((anchor, order) => ({ anchor, order })).filter(({ anchor }) => anchor.edgeIndex === edgeIndex);
		onThisEdge.sort((first, second) => alongEdge(outline[edgeIndex], first.anchor.point) - alongEdge(outline[edgeIndex], second.anchor.point));
		for (const { anchor, order } of onThisEdge) {
			anchorIndices[order] = vertices.length;
			vertices.push(anchor.point);
		}
	}
	return { vertices, anchorIndices };
}

function alongEdge(start: LayoutPoint, point: LayoutPoint) {
	return Math.hypot(point.x - start.x, point.y - start.y);
}
