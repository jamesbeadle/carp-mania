import { feetToNearestEdge } from '../layout/distanceToEdge';
import type { LakeLayout, LayoutPoint } from '../layout/layoutTypes';
import { isPointInPolygon, isPolygonInsidePolygon } from '../layout/pointInPolygon';
import { isOnTheBank, SwimRules, swimPoint } from '../layout/swimRules';
import { waterAcres } from '../layout/waterArea';
import type { Swim } from '../types';
import { IslandRules } from './catalogue';
import type { BankDraft } from './draftFootprint';
import type { Plan } from './plan';
import type { WorkDraft } from './workKinds';

const MinimumStretchPoints = 2;
const MinimumOutlinePoints = 6;
const PlotEdge = { Near: 0, Far: 1 } as const;

export function validateBankStretch(plan: Plan, draft: BankDraft): string[] {
	if (draft.points.length < MinimumStretchPoints) return ['Mark at least two points along the bank'];
	const isAlongTheBank = draft.points.every((point) => feetToNearestEdge(plan.scale, point, plan.layout.outline) <= SwimRules.MaximumFeetFromWater);
	return isAlongTheBank ? [] : [`Keep every point within ${SwimRules.MaximumFeetFromWater} ft of the bank`];
}

export function validateShoreline(plan: Plan, draft: Extract<WorkDraft, { kind: 'reshape_shoreline' }>): string[] {
	const outline = draft.outline;
	if (outline.length < MinimumOutlinePoints) return [`The shoreline needs at least ${MinimumOutlinePoints} points`];
	if (!outline.every(isInsidePlot)) return ['The shoreline must stay inside the plot'];
	const reshaped = { ...plan.layout, outline };
	const failures: string[] = [];
	if (waterAcres(reshaped, plan.plotAcres) < IslandRules.MinimumWaterAcres) failures.push(`The water must stay at least ${IslandRules.MinimumWaterAcres} acre`);
	if (!plan.layout.islands.every((island) => isPolygonInsidePolygon(island.points, outline))) failures.push('Every island must stay in the water');
	return [...failures, ...plan.swims.flatMap((swim) => strandedSwimFailure(reshaped, plan, swim))];
}

function strandedSwimFailure(reshaped: LakeLayout, plan: Plan, swim: Swim): string[] {
	const peg = swimPoint(swim);
	const isStranded = isOnTheBank(plan.layout, plan.scale, peg) && !isOnTheBank(reshaped, plan.scale, peg);
	if (!isStranded) return [];
	if (isPointInPolygon(peg, reshaped.outline)) return [`${swim.name} would be left in the water`];
	return [`${swim.name} would be left too far from the water`];
}

function isInsidePlot(point: LayoutPoint) {
	return point.x >= PlotEdge.Near && point.x <= PlotEdge.Far && point.y >= PlotEdge.Near && point.y <= PlotEdge.Far;
}
