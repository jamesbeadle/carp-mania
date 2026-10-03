import { fractionAcrossForFeet, fractionDownForFeet, type LayoutScale } from '../../layout/layoutScale';
import type { FacilitySite } from '../../layout/facilitySite';
import type { LayoutPoint } from '../../layout/layoutTypes';
import { BuildingSizes, type SiteSize } from './buildingSizes';
import { carParkPlanFor, StandardCarPark } from './carParkPlan';

const CornerSigns = [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const;

export function siteSizeOf(site: Pick<FacilitySite, 'facility' | 'carPark'>): SiteSize {
	if (site.facility !== 'car_park') return BuildingSizes[site.facility];
	const plan = carParkPlanFor(site.carPark ?? StandardCarPark);
	return { widthFeet: plan.widthFeet, depthFeet: plan.depthFeet };
}

export function siteCorners(site: FacilitySite, scale: LayoutScale): LayoutPoint[] {
	const size = siteSizeOf(site);
	return CornerSigns.map(([across, down]) => sitePointAt(site, scale, (across * size.widthFeet) / 2, (down * size.depthFeet) / 2));
}

export function sitePointAt(site: FacilitySite, scale: LayoutScale, acrossFeet: number, downFeet: number): LayoutPoint {
	const { centre } = site;
	const cosine = Math.cos(site.rotation);
	const sine = Math.sin(site.rotation);
	const turnedAcross = acrossFeet * cosine - downFeet * sine;
	const turnedDown = acrossFeet * sine + downFeet * cosine;
	return { x: centre.x + fractionAcrossForFeet(scale, turnedAcross), y: centre.y + fractionDownForFeet(scale, turnedDown) };
}
