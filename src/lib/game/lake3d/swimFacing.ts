import type { WorldPoint } from './lakeFrame';
import { isInsideOutline, pointToward } from './worldGeometry';

const Look = { Headings: 48, StepMetres: 6, FarthestMetres: 180 } as const;

export interface WaterShape {
	outline: WorldPoint[];
	islands: WorldPoint[][];
}

export function isOpenWater(point: WorldPoint, water: WaterShape) {
	return isInsideOutline(point, water.outline) && !water.islands.some((island) => isInsideOutline(point, island));
}

function waterAlong(from: WorldPoint, heading: number, water: WaterShape) {
	let reach = 0;
	for (let metres = Look.StepMetres; metres <= Look.FarthestMetres; metres += Look.StepMetres) {
		if (isOpenWater(pointToward(from, heading, metres), water)) reach += 1;
	}
	return reach;
}

export function headingOverTheWater(swim: WorldPoint, water: WaterShape) {
	const headings = Array.from({ length: Look.Headings }, (_, index) => (index / Look.Headings) * Math.PI * 2);
	const reaches = headings.map((heading) => waterAlong(swim, heading, water));
	const best = Math.max(...reaches);
	const bestHeadings = headings.filter((_, index) => reaches[index] >= best * 0.9);
	const middle = bestHeadings.reduce((sum, heading) => ({ x: sum.x + Math.sin(heading), z: sum.z + Math.cos(heading) }), { x: 0, z: 0 });
	return Math.atan2(middle.x, middle.z);
}

const EdgeSearch = { StepMetres: 0.5, FarthestMetres: 40, BackFromTheEdge: 1.2 } as const;

export function podSpotFacing(swim: WorldPoint, heading: number, water: WaterShape) {
	for (let metres = 0; metres <= EdgeSearch.FarthestMetres; metres += EdgeSearch.StepMetres) {
		if (isOpenWater(pointToward(swim, heading, metres), water)) return pointToward(swim, heading, Math.max(0, metres - EdgeSearch.BackFromTheEdge));
	}
	return swim;
}
