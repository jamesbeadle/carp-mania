import type { LayoutPoint } from '../layout/layoutTypes';
import { polygonAreaFraction, polygonCentroid } from '../layout/polygonArea';

export interface SiteSwim {
	name: string;
	position: LayoutPoint;
}

export type Pair = [x: number, y: number];

const SceneHeightToWidth = 1.5;

export function polygon(...pairs: Pair[]): LayoutPoint[] {
	return pairs.map(([x, y]) => ({ x, y }));
}

export function swim(name: string, x: number, y: number): SiteSwim {
	return { name, position: { x, y } };
}

export function oblong(centre: LayoutPoint, halfLength: number, halfWidth: number, angleRadians: number, sides = 10): LayoutPoint[] {
	return Array.from({ length: sides }, (_, index) => {
		const around = (index / sides) * Math.PI * 2;
		const along = Math.cos(around) * halfLength;
		const across = Math.sin(around) * halfWidth;
		const x = centre.x + along * Math.cos(angleRadians) - across * Math.sin(angleRadians);
		const y = centre.y + (along * Math.sin(angleRadians) + across * Math.cos(angleRadians)) * SceneHeightToWidth;
		return { x, y };
	});
}

export function scaledToAreaFraction(points: LayoutPoint[], targetFraction: number): LayoutPoint[] {
	const centre = polygonCentroid(points);
	const factor = Math.sqrt(targetFraction / polygonAreaFraction(points));
	return points.map((point) => ({ x: centre.x + (point.x - centre.x) * factor, y: centre.y + (point.y - centre.y) * factor }));
}
