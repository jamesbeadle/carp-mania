import { geoPath, type GeoPath, type GeoProjection } from 'd3-geo';
import { GlobePalette } from './globePalette';
import { graticule, landFeature, Sphere } from './worldAtlas';

const LineWidth = { Coastline: 1, Graticule: 0.8, Outline: 1.5 } as const;
const LimbGlowShareOfRadius = 0.14;

export function drawGlobe(context: CanvasRenderingContext2D, projection: GeoProjection) {
	const path = geoPath(projection, context);
	drawLimbGlow(context, projection);
	fillLand(context, path);
	strokeGraticule(context, path);
	strokeOutline(context, path);
}

function drawLimbGlow(context: CanvasRenderingContext2D, projection: GeoProjection) {
	const [centreX, centreY] = projection.translate();
	const radius = projection.scale();
	const outerRadius = radius * (1 + LimbGlowShareOfRadius);
	const glow = context.createRadialGradient(centreX, centreY, radius, centreX, centreY, outerRadius);
	glow.addColorStop(0, GlobePalette.LimbGlowInner);
	glow.addColorStop(1, GlobePalette.LimbGlowOuter);
	context.fillStyle = glow;
	context.beginPath();
	context.arc(centreX, centreY, outerRadius, 0, Math.PI * 2);
	context.arc(centreX, centreY, radius, 0, Math.PI * 2, true);
	context.fill();
}

function fillLand(context: CanvasRenderingContext2D, path: GeoPath) {
	context.beginPath();
	path(landFeature);
	context.fillStyle = GlobePalette.Land;
	context.fill();
	context.strokeStyle = GlobePalette.Coastline;
	context.lineWidth = LineWidth.Coastline;
	context.stroke();
}

function strokeGraticule(context: CanvasRenderingContext2D, path: GeoPath) {
	context.beginPath();
	path(graticule);
	context.strokeStyle = GlobePalette.Graticule;
	context.lineWidth = LineWidth.Graticule;
	context.stroke();
}

function strokeOutline(context: CanvasRenderingContext2D, path: GeoPath) {
	context.beginPath();
	path(Sphere);
	context.strokeStyle = GlobePalette.Outline;
	context.lineWidth = LineWidth.Outline;
	context.stroke();
}
