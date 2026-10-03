import { siteCorners } from '$lib/domain/groundworks/sites/siteFootprint';
import type { FacilitySite } from '$lib/domain/layout/facilitySite';
import { layoutScaleFor } from '$lib/domain/layout/layoutScale';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { isPointInPolygon } from '$lib/domain/layout/pointInPolygon';

export function siteAt(sites: FacilitySite[], point: LayoutPoint, plotAcres: number) {
	const scale = layoutScaleFor(plotAcres);
	return sites.find((site) => isPointInPolygon(point, siteCorners(site, scale))) ?? null;
}
