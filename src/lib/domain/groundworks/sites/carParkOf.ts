import type { CarParkSpec } from '../../layout/facilitySite';
import type { LakeLayout } from '../../layout/layoutTypes';
import { StandardCarPark } from './carParkPlan';

export function carParkOf(layout: LakeLayout): CarParkSpec | null {
	if (!layout.facilities.includes('car_park')) return null;
	const site = (layout.sites ?? []).find((candidate) => candidate.facility === 'car_park');
	return site?.carPark ?? StandardCarPark;
}
