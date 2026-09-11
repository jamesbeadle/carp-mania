import type { GlobePoint } from '$lib/domain/world/greatCircle';
import { geoInterpolate, type GeoProjection } from 'd3-geo';
import { arcColour } from './globePalette';
import { projectVisible, type GlobeView } from './projection';

export interface GlobeArc {
	from: GlobePoint;
	to: GlobePoint;
	startedAt: number;
}

export const ArcTiming = { LifetimeMs: 10_000, GrowMs: 1_800 } as const;
const ArcShape = { Samples: 48, RiseShareOfRadius: 0.16, LineWidth: 1.5, HeadRadius: 2.5 } as const;

interface ScreenPoint {
	x: number;
	y: number;
}

export function drawArcs(context: CanvasRenderingContext2D, projection: GeoProjection, view: GlobeView, arcs: GlobeArc[], now: number) {
	for (const arc of arcs) {
		const age = now - arc.startedAt;
		if (age < 0 || age > ArcTiming.LifetimeMs) continue;
		drawArc(context, projection, view, arc, age);
	}
}

function drawArc(context: CanvasRenderingContext2D, projection: GeoProjection, view: GlobeView, arc: GlobeArc, age: number) {
	const interpolate = geoInterpolate([arc.from.longitude, arc.from.latitude], [arc.to.longitude, arc.to.latitude]);
	const progress = easeOut(Math.min(1, age / ArcTiming.GrowMs));
	const alpha = 1 - age / ArcTiming.LifetimeMs;
	const pointAlong = (share: number) => {
		const [longitude, latitude] = interpolate(share * progress);
		return liftedPoint(projection, view, { latitude, longitude }, Math.sin(Math.PI * share * progress) * ArcShape.RiseShareOfRadius);
	};
	context.save();
	context.strokeStyle = arcColour(alpha);
	context.fillStyle = arcColour(alpha);
	context.lineWidth = ArcShape.LineWidth;
	strokeThrough(context, Array.from({ length: ArcShape.Samples + 1 }, (_, index) => pointAlong(index / ArcShape.Samples)));
	drawHead(context, pointAlong(1));
	context.restore();
}

function strokeThrough(context: CanvasRenderingContext2D, points: (ScreenPoint | null)[]) {
	context.beginPath();
	for (const run of visibleRuns(points)) {
		context.moveTo(run[0].x, run[0].y);
		for (const point of run.slice(1)) context.lineTo(point.x, point.y);
	}
	context.stroke();
}

function visibleRuns(points: (ScreenPoint | null)[]): ScreenPoint[][] {
	const runs: ScreenPoint[][] = [[]];
	for (const point of points) {
		const currentRun = runs[runs.length - 1];
		if (point) currentRun.push(point);
		if (!point && currentRun.length > 0) runs.push([]);
	}
	return runs.filter((run) => run.length > 0);
}

function drawHead(context: CanvasRenderingContext2D, head: ScreenPoint | null) {
	if (!head) return;
	context.beginPath();
	context.arc(head.x, head.y, ArcShape.HeadRadius, 0, Math.PI * 2);
	context.fill();
}

function liftedPoint(projection: GeoProjection, view: GlobeView, point: GlobePoint, rise: number): ScreenPoint | null {
	const projected = projectVisible(projection, view, point);
	if (!projected) return null;
	const [centreX, centreY] = projection.translate();
	return { x: centreX + (projected[0] - centreX) * (1 + rise), y: centreY + (projected[1] - centreY) * (1 + rise) };
}

function easeOut(share: number) {
	return 1 - (1 - share) ** 3;
}
