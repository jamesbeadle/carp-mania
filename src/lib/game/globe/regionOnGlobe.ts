import type { GlobePoint } from '$lib/domain/world/greatCircle';
import type { RegionCode } from '$lib/domain/world/regionCodes';
import { RegionCatalogue, type RegionBounds } from '$lib/domain/world/regions';
import { geoPath, type GeoProjection } from 'd3-geo';
import type { Polygon, Position } from 'geojson';
import { GlobePalette } from './globePalette';
import { GlobeZoom } from './projection';

const EdgeStepDegrees = 2;
const RegionShareOfGlobeWidth = 0.6;
const DegreesToRadians = Math.PI / 180;

export function regionCentre(region: RegionCode): GlobePoint {
	const { west, east, south, north } = RegionCatalogue[region].bounds;
	return { latitude: (south + north) / 2, longitude: (west + east) / 2 };
}

export function regionZoom(region: RegionCode) {
	const { west, east, south, north } = RegionCatalogue[region].bounds;
	const middleLatitude = ((south + north) / 2) * DegreesToRadians;
	const widestSpanDegrees = Math.max(north - south, (east - west) * Math.cos(middleLatitude));
	const zoomToFrame = RegionShareOfGlobeWidth / Math.sin((widestSpanDegrees / 2) * DegreesToRadians);
	return Math.min(GlobeZoom.Maximum, Math.max(GlobeZoom.Minimum, zoomToFrame));
}

export function regionPolygon(bounds: RegionBounds): Polygon {
	const { west, east, south, north } = bounds;
	const ring = [
		...alongParallel(north, west, east),
		...alongMeridian(east, north, south),
		...alongParallel(south, east, west),
		...alongMeridian(west, south, north),
		[west, north]
	];
	return { type: 'Polygon', coordinates: [ring] };
}

export function drawRegionShade(context: CanvasRenderingContext2D, projection: GeoProjection, region: RegionCode) {
	const path = geoPath(projection, context);
	context.beginPath();
	path(regionPolygon(RegionCatalogue[region].bounds));
	context.fillStyle = GlobePalette.RegionFill;
	context.fill();
	context.strokeStyle = GlobePalette.RegionEdge;
	context.lineWidth = 1;
	context.stroke();
}

function alongParallel(latitude: number, fromLongitude: number, toLongitude: number): Position[] {
	return stepsBetween(fromLongitude, toLongitude).map((longitude) => [longitude, latitude]);
}

function alongMeridian(longitude: number, fromLatitude: number, toLatitude: number): Position[] {
	return stepsBetween(fromLatitude, toLatitude).map((latitude) => [longitude, latitude]);
}

function stepsBetween(from: number, to: number) {
	const stepCount = Math.max(1, Math.ceil(Math.abs(to - from) / EdgeStepDegrees));
	return Array.from({ length: stepCount }, (_, index) => from + ((to - from) * index) / stepCount);
}
