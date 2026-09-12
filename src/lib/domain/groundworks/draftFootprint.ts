import { feetBetween, layoutScaleFor, type LayoutScale } from '../layout/layoutScale';
import type { LakeLayout, LayoutPoint } from '../layout/layoutTypes';
import { polygonAreaFraction } from '../layout/polygonArea';
import { islandPolygonFor } from './islandTemplates';
import { shelfPolygonFor } from './shelfStrip';
import { FacilityKinds, type WorkDraft } from './workKinds';

export type FootprintShape = 'polygon' | 'polyline' | 'point';

export interface Footprint {
	shape: FootprintShape;
	points: LayoutPoint[];
}

export type AreaDraft = Extract<WorkDraft, { kind: 'gravel_bar' | 'deepen' | 'dredge' | 'lily_pads' }>;
export type BankDraft = Extract<WorkDraft, { kind: 'margin_shelf' | 'reed_bed' }>;

export function isAreaDraft(draft: WorkDraft): draft is AreaDraft {
	return draft.kind === 'gravel_bar' || draft.kind === 'deepen' || draft.kind === 'dredge' || draft.kind === 'lily_pads';
}

export function isBankDraft(draft: WorkDraft): draft is BankDraft {
	return draft.kind === 'margin_shelf' || draft.kind === 'reed_bed';
}

export function isFacilityDraft(draft: WorkDraft) {
	return FacilityKinds.includes(draft.kind);
}

export function footprintOf(draft: WorkDraft, layout: LakeLayout, plotAcres: number): Footprint {
	if (draft.kind === 'island') return { shape: 'polygon', points: islandPolygonFor(draft.size, draft.centre, draft.rotation, plotAcres) };
	if (draft.kind === 'margin_shelf') return { shape: 'polygon', points: shelfPolygonFor(draft.points, layout, layoutScaleFor(plotAcres)) };
	if (draft.kind === 'reed_bed') return { shape: 'polyline', points: draft.points };
	if (draft.kind === 'snag') return { shape: 'point', points: [draft.point] };
	if (draft.kind === 'reshape_shoreline') return { shape: 'polygon', points: draft.outline };
	if (isAreaDraft(draft)) return { shape: 'polygon', points: draft.points };
	return { shape: 'point', points: [] };
}

export function polygonAcres(points: LayoutPoint[], plotAcres: number) {
	return polygonAreaFraction(points) * plotAcres;
}

export function polylineFeet(points: LayoutPoint[], scale: LayoutScale) {
	let feet = 0;
	for (let index = 1; index < points.length; index++) feet += feetBetween(scale, points[index - 1], points[index]);
	return feet;
}

export function perimeterFeet(points: LayoutPoint[], scale: LayoutScale) {
	if (points.length < 2) return 0;
	return polylineFeet([...points, points[0]], scale);
}

export function acresLabel(acres: number) {
	const rounded = Math.round(acres * 100) / 100;
	return `${rounded} ${rounded > 1 ? 'acres' : 'acre'}`;
}
