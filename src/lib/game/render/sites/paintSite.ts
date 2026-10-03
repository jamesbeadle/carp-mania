import { siteSizeOf } from '$lib/domain/groundworks/sites/siteFootprint';
import { StandardCarPark } from '$lib/domain/groundworks/sites/carParkPlan';
import type { FacilitySite } from '$lib/domain/layout/facilitySite';
import { paintAerator } from './paintAerator';
import { paintBuilding } from './paintBuilding';
import { paintCarPark } from './paintCarPark';
import { RoofTones } from './sitePalette';

export function paintSite(context: CanvasRenderingContext2D, site: FacilitySite, timeSeconds: number) {
	if (site.facility === 'car_park') return paintCarPark(context, site.carPark ?? StandardCarPark);
	const size = siteSizeOf(site);
	if (site.facility === 'aerator') return paintAerator(context, size, timeSeconds);
	paintBuilding(context, size, RoofTones[site.facility]);
}
