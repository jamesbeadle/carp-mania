import { feetToNearestEdge } from '../../layout/distanceToEdge';
import type { FacilitySite } from '../../layout/facilitySite';
import type { LayoutScale } from '../../layout/layoutScale';
import type { LakeLayout, LayoutPoint } from '../../layout/layoutTypes';
import { doPolygonsOverlap, isPointInPolygon } from '../../layout/pointInPolygon';
import { isInWater } from '../../layout/waterArea';
import { FacilityCatalogue } from '../facilities';
import { isPlacedInTheWater } from './buildingSizes';
import { siteCorners } from './siteFootprint';

export const SiteClearance = { FromTheWaterFeet: 10, FromAPegFeet: 30 } as const;

export interface SiteSurroundings {
	layout: LakeLayout;
	scale: LayoutScale;
	pegs: LayoutPoint[];
	neighbours: FacilitySite[];
}

const PlotEdge = { Near: 0, Far: 1 } as const;

function nameOf(site: Pick<FacilitySite, 'facility'>) {
	const profile = FacilityCatalogue[site.facility];
	return profile.label.toLowerCase();
}

export function siteFitFailures(site: FacilitySite, surroundings: SiteSurroundings): string[] {
	const corners = siteCorners(site, surroundings.scale);
	const waterFailure = isPlacedInTheWater(site.facility) ? openWaterFailure(site, corners, surroundings) : dryLandFailure(site, corners, surroundings);
	const failures = [plotFailure(site, corners), waterFailure, pegFailure(corners, surroundings), neighbourFailure(corners, surroundings)];
	return failures.filter((failure): failure is string => failure !== null);
}

function plotFailure(site: FacilitySite, corners: LayoutPoint[]) {
	const isOnThePlot = corners.every((corner) => [corner.x, corner.y].every((value) => value >= PlotEdge.Near && value <= PlotEdge.Far));
	return isOnThePlot ? null : `The ${nameOf(site)} must sit wholly on your land`;
}

function dryLandFailure(site: FacilitySite, corners: LayoutPoint[], { layout, scale }: SiteSurroundings) {
	const outline = layout.outline;
	const isTouchingWater = doPolygonsOverlap(corners, outline);
	const isOnTheWatersEdge = corners.some((corner) => feetToNearestEdge(scale, corner, outline) < SiteClearance.FromTheWaterFeet);
	return isTouchingWater || isOnTheWatersEdge ? `The ${nameOf(site)} must sit on dry land, ${SiteClearance.FromTheWaterFeet} ft back from the water` : null;
}

function openWaterFailure(site: FacilitySite, corners: LayoutPoint[], surroundings: SiteSurroundings) {
	const isAfloat = corners.every((corner) => isInWater(surroundings.layout, corner));
	return isAfloat ? null : `The ${nameOf(site)} goes in open water`;
}

function pegFailure(corners: LayoutPoint[], surroundings: SiteSurroundings) {
	const isTooClose = (peg: LayoutPoint) => isPointInPolygon(peg, corners) || feetToNearestEdge(surroundings.scale, peg, corners) < SiteClearance.FromAPegFeet;
	const isCrowdingAPeg = surroundings.pegs.some(isTooClose);
	return isCrowdingAPeg ? `Keep it ${SiteClearance.FromAPegFeet} ft clear of the pegs` : null;
}

function neighbourFailure(corners: LayoutPoint[], surroundings: SiteSurroundings) {
	const neighbour = surroundings.neighbours.find((other) => doPolygonsOverlap(corners, siteCorners(other, surroundings.scale)));
	return neighbour ? `That overlaps the ${nameOf(neighbour)}` : null;
}
