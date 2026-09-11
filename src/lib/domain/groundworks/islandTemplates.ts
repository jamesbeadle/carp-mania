import { layoutScaleFor, SquareFeetPerAcre } from '../layout/layoutScale';
import type { LayoutPoint } from '../layout/layoutTypes';
import { polygonAreaFraction } from '../layout/polygonArea';
import { IslandWorks } from './catalogue';
import type { IslandSize } from './workKinds';

const BlobRadii = [1.0, 1.12, 0.96, 1.18, 1.04, 0.88, 1.1, 0.92, 1.06];
const BlobStretchAlong = 1.35;

export function islandPolygonFor(size: IslandSize, centre: LayoutPoint, rotation: number, plotAcres: number): LayoutPoint[] {
	const scale = layoutScaleFor(plotAcres);
	const blob = unitBlob();
	const feetPerUnit = Math.sqrt((IslandWorks[size].acres * SquareFeetPerAcre) / polygonAreaFraction(blob));
	return blob
		.map((point) => rotated(point, rotation))
		.map((point) => ({ x: centre.x + (point.x * feetPerUnit) / scale.feetAcross, y: centre.y + (point.y * feetPerUnit) / scale.feetDown }));
}

export function islandAcresFor(size: IslandSize) {
	return IslandWorks[size].acres;
}

function unitBlob(): LayoutPoint[] {
	return BlobRadii.map((radius, index) => {
		const angle = (index / BlobRadii.length) * Math.PI * 2;
		return { x: Math.cos(angle) * radius * BlobStretchAlong, y: Math.sin(angle) * radius };
	});
}

function rotated(point: LayoutPoint, rotation: number): LayoutPoint {
	const cosine = Math.cos(rotation);
	const sine = Math.sin(rotation);
	return { x: point.x * cosine - point.y * sine, y: point.x * sine + point.y * cosine };
}
