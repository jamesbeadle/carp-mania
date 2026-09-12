import type { LayoutScale } from '../layout/layoutScale';
import type { LakeLayout, LayoutPoint } from '../layout/layoutTypes';
import { lakeCentroid } from '../layout/waterArea';
import { WorkPrices } from './catalogue';

const MinimumStripPoints = 2;

export function shelfPolygonFor(polyline: LayoutPoint[], layout: LakeLayout, scale: LayoutScale): LayoutPoint[] {
	if (polyline.length < MinimumStripPoints) return [];
	const centre = lakeCentroid(layout);
	const waterSide = polyline.map((vertex, index) => offsetTowardsWater(vertex, normalAt(polyline, index, scale), centre, scale));
	return [...polyline, ...waterSide.reverse()];
}

function normalAt(polyline: LayoutPoint[], index: number, scale: LayoutScale): LayoutPoint {
	const before = polyline[Math.max(0, index - 1)];
	const after = polyline[Math.min(polyline.length - 1, index + 1)];
	const alongFeetX = (after.x - before.x) * scale.feetAcross;
	const alongFeetY = (after.y - before.y) * scale.feetDown;
	const length = Math.hypot(alongFeetX, alongFeetY) || 1;
	return { x: -alongFeetY / length, y: alongFeetX / length };
}

function offsetTowardsWater(vertex: LayoutPoint, normal: LayoutPoint, centre: LayoutPoint, scale: LayoutScale): LayoutPoint {
	const towardsCentreX = (centre.x - vertex.x) * scale.feetAcross;
	const towardsCentreY = (centre.y - vertex.y) * scale.feetDown;
	const isNormalFacingWater = normal.x * towardsCentreX + normal.y * towardsCentreY >= 0;
	const sign = isNormalFacingWater ? 1 : -1;
	const width = WorkPrices.MarginShelf.widthFeet;
	return { x: vertex.x + (sign * normal.x * width) / scale.feetAcross, y: vertex.y + (sign * normal.y * width) / scale.feetDown };
}
