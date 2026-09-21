import { Facilities, type Facility, type LakeLayout } from '$lib/domain/layout/layoutTypes';
import { spotOnTheBank } from './bankSpot';
import type { Point } from './lakeShape';

export interface FacilitySpot {
	facility: Facility;
	point: Point;
}

const Spread = { StartAngle: -Math.PI / 2, StepAngle: Math.PI / 6, BeyondTheBank: 30 } as const;

export function facilitySpotsOf(layout: LakeLayout): FacilitySpot[] {
	const built = Facilities.filter((facility) => layout.facilities.includes(facility));
	return built.map((facility, index) => ({ facility, point: spotOnTheBank(layout, Spread.StartAngle + index * Spread.StepAngle, Spread.BeyondTheBank) }));
}
