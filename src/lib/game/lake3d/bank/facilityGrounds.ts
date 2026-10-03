import { siteSizeOf } from '$lib/domain/groundworks/sites/siteFootprint';
import type { FacilitySite } from '$lib/domain/layout/facilitySite';
import { MetresPerFoot, worldPointOf, type LakeFrame, type WorldPoint } from '../lakeFrame';

export interface FacilityPlot {
	site: FacilitySite;
	point: WorldPoint;
	facing: number;
	footprintMetres: number;
}

export interface ClearSpot {
	point: WorldPoint;
	radius: number;
}

export function plotFacilities(sites: FacilitySite[], frame: LakeFrame): FacilityPlot[] {
	return sites.map((site) => {
		const size = siteSizeOf(site);
		const footprintMetres = Math.max(size.widthFeet, size.depthFeet) * MetresPerFoot;
		return { site, point: worldPointOf(frame, site.centre), facing: -site.rotation, footprintMetres };
	});
}
