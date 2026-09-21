import { Facilities, type Facility, type LakeLayout } from '$lib/domain/layout/layoutTypes';
import { lakeCentreOf, toScene, type Point } from './lakeShape';

export interface FacilitySpot {
	facility: Facility;
	point: Point;
}

const Spread = { StartAngle: -Math.PI / 2, StepAngle: Math.PI / 6, BeyondTheBank: 30 } as const;

export function facilitySpotsOf(layout: LakeLayout): FacilitySpot[] {
	const built = Facilities.filter((facility) => layout.facilities.includes(facility));
	const centre = lakeCentreOf(layout);
	const bank = layout.outline.map(toScene);
	return built.map((facility, index) => ({ facility, point: spotOnTheBank(bank, centre, Spread.StartAngle + index * Spread.StepAngle) }));
}

function spotOnTheBank(bank: Point[], centre: Point, wantedAngle: number): Point {
	const nearest = bank.reduce<Point | null>((best, point) => (best === null || angleGap(point, centre, wantedAngle) < angleGap(best, centre, wantedAngle) ? point : best), null);
	const anchor = nearest ?? centre;
	const outward = Math.atan2(anchor.y - centre.y, anchor.x - centre.x);
	return { x: anchor.x + Math.cos(outward) * Spread.BeyondTheBank, y: anchor.y + Math.sin(outward) * Spread.BeyondTheBank };
}

function angleGap(point: Point, centre: Point, wantedAngle: number) {
	const angle = Math.atan2(point.y - centre.y, point.x - centre.x);
	const gap = Math.abs(angle - wantedAngle) % (Math.PI * 2);
	return Math.min(gap, Math.PI * 2 - gap);
}
