import { FacilityCatalogue } from '$lib/domain/groundworks/facilities';
import { carParkSummary } from '$lib/domain/groundworks/sites/carParkEffects';
import type { FacilitySite } from '$lib/domain/layout/facilitySite';
import { toScene, type Point } from '../scene/lakeShape';
import { BankPalette } from '../scene/palette';
import { drawCanvasLabel } from './drawCanvasLabel';
import { FacilityGlyphBox, FacilityGlyphFillRule, FacilityGlyphPaths } from './facilityGlyphs';
import { paintInSiteFrame } from './sites/siteFrame';
import { paintSite } from './sites/paintSite';

const Badge = { Size: 20, Radius: 6, GlyphScale: 0.85 } as const;

export interface SitesOnTheScene {
	sites: FacilitySite[];
	pixelsPerFoot: number;
}

export function drawFacilities(context: CanvasRenderingContext2D, scene: SitesOnTheScene, isLabelled: boolean, timeSeconds: number) {
	for (const site of scene.sites) paintInSiteFrame(context, site, scene.pixelsPerFoot, () => paintSite(context, site, timeSeconds));
	for (const site of scene.sites) {
		const centre = toScene(site.centre);
		if (site.facility !== 'car_park') drawBadge(context, centre, site);
		if (isLabelled) drawCanvasLabel(context, centre, siteLabelOf(site), BankPalette.FacilityLabel, false);
	}
}

export function siteLabelOf(site: FacilitySite) {
	const label = FacilityCatalogue[site.facility].label;
	return site.carPark ? `${label} · ${carParkSummary(site.carPark)}` : label;
}

function drawBadge(context: CanvasRenderingContext2D, centre: Point, site: FacilitySite) {
	const half = Badge.Size / 2;
	context.save();
	context.fillStyle = BankPalette.FacilityBadge;
	context.strokeStyle = BankPalette.FacilityBadgeEdge;
	context.lineWidth = 1.5;
	context.beginPath();
	context.roundRect(centre.x - half, centre.y - half, Badge.Size, Badge.Size, Badge.Radius);
	context.fill();
	context.stroke();
	const glyphSize = FacilityGlyphBox * Badge.GlyphScale;
	context.translate(centre.x - glyphSize / 2, centre.y - glyphSize / 2);
	context.scale(Badge.GlyphScale, Badge.GlyphScale);
	context.fillStyle = BankPalette.FacilityGlyph;
	context.fill(new Path2D(FacilityGlyphPaths[site.facility]), FacilityGlyphFillRule);
	context.restore();
}
