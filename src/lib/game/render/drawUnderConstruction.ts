import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { polygonCentroid } from '$lib/domain/layout/polygonArea';
import { smoothClosedPath, toScene, type Point } from '../scene/lakeShape';
import { DraftPalette } from '../scene/palette';
import { drawCanvasLabel } from './drawCanvasLabel';

export type DraftKind = 'polygon' | 'point' | 'polyline';

export interface DraftShape {
	kind: DraftKind;
	points: LayoutPoint[];
	label: string;
	isValid: boolean;
}

const DraftDash: number[] = [8, 6];
const Draft = { LineWidth: 2, PointRadius: 14, PointDotRadius: 3, MinimumPolygonPoints: 3 } as const;

export function drawDrafts(context: CanvasRenderingContext2D, drafts: DraftShape[]) {
	for (const draft of drafts) drawDraft(context, draft);
}

function drawDraft(context: CanvasRenderingContext2D, draft: DraftShape) {
	if (draft.points.length === 0) return;
	const colour = draft.isValid ? DraftPalette.Valid : DraftPalette.Invalid;
	context.save();
	context.setLineDash(DraftDash);
	context.lineWidth = Draft.LineWidth;
	context.strokeStyle = colour;
	context.fillStyle = draft.isValid ? DraftPalette.ValidFill : DraftPalette.InvalidFill;
	traceDraft(context, draft.kind, draft.points.map(toScene), colour);
	context.restore();
	drawCanvasLabel(context, toScene(polygonCentroid(draft.points)), draft.label, colour, true);
}

function traceDraft(context: CanvasRenderingContext2D, kind: DraftKind, points: Point[], colour: string) {
	if (kind === 'point') return traceDraftPoint(context, points[0], colour);
	if (kind === 'polyline' || points.length < Draft.MinimumPolygonPoints) return traceDraftLine(context, points);
	const polygon = smoothClosedPath(points);
	context.fill(polygon);
	context.stroke(polygon);
}

function traceDraftPoint(context: CanvasRenderingContext2D, centre: Point, colour: string) {
	context.beginPath();
	context.arc(centre.x, centre.y, Draft.PointRadius, 0, Math.PI * 2);
	context.fill();
	context.stroke();
	context.setLineDash([]);
	context.fillStyle = colour;
	context.beginPath();
	context.arc(centre.x, centre.y, Draft.PointDotRadius, 0, Math.PI * 2);
	context.fill();
}

function traceDraftLine(context: CanvasRenderingContext2D, points: Point[]) {
	context.beginPath();
	points.forEach((point, index) => (index === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y)));
	context.stroke();
}
