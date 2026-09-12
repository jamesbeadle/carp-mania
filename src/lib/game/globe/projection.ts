import type { GlobePoint } from '$lib/domain/world/greatCircle';
import { geoDistance, geoOrthographic, type GeoProjection } from 'd3-geo';

export interface GlobeView {
	centre: GlobePoint;
	zoom: number;
}

export interface Viewport {
	width: number;
	height: number;
}

export const GlobeZoom = { Fit: 1, Minimum: 0.9, Maximum: 6 } as const;
const FitRadiusShareOfHalfSize = 0.92;
const HemisphereDegrees = 90;
const HemisphereRadians = Math.PI / 2;

export function fitRadiusFor(viewport: Viewport) {
	return (Math.min(viewport.width, viewport.height) / 2) * FitRadiusShareOfHalfSize;
}

export function projectionFor(view: GlobeView, viewport: Viewport): GeoProjection {
	return geoOrthographic()
		.rotate([-view.centre.longitude, -view.centre.latitude])
		.scale(fitRadiusFor(viewport) * view.zoom)
		.translate([viewport.width / 2, viewport.height / 2])
		.clipAngle(HemisphereDegrees);
}

export function pointToGlobe(projection: GeoProjection, x: number, y: number): GlobePoint | null {
	if (!isOnTheDisc(projection, x, y)) return null;
	const inverted = projection.invert?.([x, y]);
	if (!inverted || !Number.isFinite(inverted[0]) || !Number.isFinite(inverted[1])) return null;
	return { longitude: inverted[0], latitude: inverted[1] };
}

function isOnTheDisc(projection: GeoProjection, x: number, y: number) {
	const [centreX, centreY] = projection.translate();
	return Math.hypot(x - centreX, y - centreY) <= projection.scale();
}

export function isVisible(view: GlobeView, point: GlobePoint) {
	return geoDistance([point.longitude, point.latitude], [view.centre.longitude, view.centre.latitude]) < HemisphereRadians;
}

export function projectVisible(projection: GeoProjection, view: GlobeView, point: GlobePoint): [number, number] | null {
	if (!isVisible(view, point)) return null;
	return projection([point.longitude, point.latitude]);
}
