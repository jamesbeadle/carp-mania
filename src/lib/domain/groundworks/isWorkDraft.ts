import type { LayoutPoint } from '../layout/layoutTypes';
import { isWorkKind, type WorkDraft } from './workKinds';

export const WorkNameLength = { Minimum: 2, Maximum: 40 } as const;
const MaximumPointsPerDraft = 200;
const IslandSizes = ['small', 'medium', 'large'];
const ShelfBeds = ['gravel', 'clay'];

type Candidate = Record<string, unknown>;

export function isWorkDraft(candidate: unknown): candidate is WorkDraft {
	if (!isRecord(candidate) || typeof candidate.kind !== 'string' || !isWorkKind(candidate.kind)) return false;
	const kind = candidate.kind;
	if (kind === 'island') return IslandSizes.includes(String(candidate.size)) && isPoint(candidate.centre) && isFiniteNumber(candidate.rotation) && isName(candidate.name);
	if (kind === 'gravel_bar' || kind === 'deepen') return isPointList(candidate.points) && isFiniteNumber(candidate.depthFeet);
	if (kind === 'dredge' || kind === 'reed_bed' || kind === 'lily_pads') return isPointList(candidate.points);
	if (kind === 'margin_shelf') return isPointList(candidate.points) && ShelfBeds.includes(String(candidate.bed));
	if (kind === 'snag') return isPoint(candidate.point) && isName(candidate.name);
	if (kind === 'reshape_shoreline') return isPointList(candidate.outline);
	return true;
}

export function isName(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length >= WorkNameLength.Minimum && value.trim().length <= WorkNameLength.Maximum;
}

export function withTrimmedName(draft: WorkDraft): WorkDraft {
	if (draft.kind === 'island' || draft.kind === 'snag') return { ...draft, name: draft.name.trim() };
	return draft;
}

function isRecord(value: unknown): value is Candidate {
	return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

function isPoint(value: unknown): value is LayoutPoint {
	return isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y);
}

function isPointList(value: unknown): value is LayoutPoint[] {
	return Array.isArray(value) && value.length <= MaximumPointsPerDraft && value.every(isPoint);
}
