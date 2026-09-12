import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { polygonCentroid } from '$lib/domain/layout/polygonArea';
import { smoothClosedPath, toScene, type Point } from '../scene/lakeShape';
import { DraftPalette } from '../scene/palette';
import { drawCanvasLabel } from './drawCanvasLabel';
import { drawDraftHandles, type DraftHandle } from './drawDraftHandles';

export type DraftKind = 'polygon' | 'point' | 'polyline';

export interface DraftShape {
	kind: DraftKind;
	points: LayoutPoint[];
	label: string;
	isValid: boolean;
	isBeingDrawn?: boolean;
	handles?: DraftHandle[];
}

const DraftDash: number[] = [8, 6];
const Draft = { LineWidth: 2, PointRadius: 14, PointDotRadius: 3, MinimumPolygonPoints: 3, ClosingEdgeAlpha: 0.45 } as const;

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
	traceDraft(context, draft, draft.points.map(toScene), colour);
	context.restore();
	drawDraftHandles(context, draft.handles ?? [], colour);
	drawCanvasLabel(context, toScene(polygonCentroid(draft.points)), draft.label, colour, true);
}

function traceDraft(context: CanvasRenderingContext2D, draft: DraftShape, points: Point[], colour: string) {
	if (draft.kind === 'point') return traceDraftPoint(context, points[0], colour);
	if (draft.isBeingDrawn) return traceUnderConstruction(context, draft.kind, points);
	if (draft.kind === 'polyline' || points.length < Draft.MinimumPolygonPoints) return traceDraftLine(context, points);
	const polygon = smoothClosedPath(points);
	context.fill(polygon);
	context.stroke(polygon);
}

function traceUnderConstruction(context: CanvasRenderingContext2D, kind: DraftKind, points: Point[]) {
	traceDraftLine(context, points);
	if (kind !== 'polygon' || points.length < Draft.MinimumPolygonPoints) return;
	context.fill(straightClosedPath(points));
	context.globalAlpha = Draft.ClosingEdgeAlpha;
	traceDraftLine(context, [points[points.length - 1], points[0]]);
	context.globalAlpha = 1;
}

function straightClosedPath(points: Point[]) {
	const path = new Path2D();
	points.forEach((point, index) => (index === 0 ? path.moveTo(point.x, point.y) : path.lineTo(point.x, point.y)));
	path.closePath();
	return path;
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
