import type { LayoutScale } from './layoutScale';
import type { LakeLayout, LayoutPoint } from './layoutTypes';
import { isPointInPolygon } from './pointInPolygon';
import { polygonAreaFraction, polygonCentroid } from './polygonArea';

export function waterAcres(layout: LakeLayout, plotAcres: number) {
	const islandFraction = layout.islands.reduce((total, island) => total + polygonAreaFraction(island.points), 0);
	const waterFraction = Math.max(0, polygonAreaFraction(layout.outline) - islandFraction);
	return Math.round(waterFraction * plotAcres * 100) / 100;
}

export function islandAcres(layout: LakeLayout, plotAcres: number) {
	return layout.islands.reduce((total, island) => total + polygonAreaFraction(island.points), 0) * plotAcres;
}

export function isInWater(layout: LakeLayout, point: LayoutPoint) {
	if (!isPointInPolygon(point, layout.outline)) return false;
	return !layout.islands.some((island) => isPointInPolygon(point, island.points));
}

export function lakeCentroid(layout: LakeLayout): LayoutPoint {
	return polygonCentroid(layout.outline);
}

export function pointFeetTowardsCentre(layout: LakeLayout, scale: LayoutScale, from: LayoutPoint, feet: number): LayoutPoint {
	const centre = lakeCentroid(layout);
	const acrossFeet = (centre.x - from.x) * scale.feetAcross;
	const downFeet = (centre.y - from.y) * scale.feetDown;
	const distance = Math.hypot(acrossFeet, downFeet);
	if (distance === 0) return from;
	const step = Math.min(1, feet / distance);
	return { x: from.x + (centre.x - from.x) * step, y: from.y + (centre.y - from.y) * step };
}
