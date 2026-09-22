import { FacilityCatalogue } from '$lib/domain/groundworks/facilities';
import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import type { Swim } from '$lib/domain/types';
import { facilitySpotsOf, type FacilitySpot } from '../scene/facilitySpots';
import { BankPalette } from '../scene/palette';
import { drawCanvasLabel } from './drawCanvasLabel';
import { FacilityGlyphBox, FacilityGlyphFillRule, FacilityGlyphPaths } from './facilityGlyphs';

const Badge = { Size: 26, Radius: 7, GlyphScale: 1.1 } as const;

export function drawFacilities(context: CanvasRenderingContext2D, layout: LakeLayout, swims: Swim[], isLabelled: boolean) {
	for (const spot of facilitySpotsOf(layout, swims)) {
		drawBadge(context, spot);
		if (isLabelled) drawCanvasLabel(context, spot.point, FacilityCatalogue[spot.facility].label, BankPalette.FacilityLabel, false);
	}
}

function drawBadge(context: CanvasRenderingContext2D, spot: FacilitySpot) {
	const { x, y } = spot.point;
	const half = Badge.Size / 2;
	context.save();
	context.fillStyle = BankPalette.FacilityBadge;
	context.strokeStyle = BankPalette.FacilityBadgeEdge;
	context.lineWidth = 1.5;
	context.beginPath();
	context.roundRect(x - half, y - half, Badge.Size, Badge.Size, Badge.Radius);
	context.fill();
	context.stroke();
	const glyphSize = FacilityGlyphBox * Badge.GlyphScale;
	context.translate(x - glyphSize / 2, y - glyphSize / 2);
	context.scale(Badge.GlyphScale, Badge.GlyphScale);
	context.fillStyle = BankPalette.FacilityGlyph;
	context.fill(new Path2D(FacilityGlyphPaths[spot.facility]), FacilityGlyphFillRule);
	context.restore();
}
