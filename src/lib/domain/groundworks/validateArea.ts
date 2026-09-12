import { feetToNearestEdge } from '../layout/distanceToEdge';
import type { LayoutPoint } from '../layout/layoutTypes';
import { polygonCentroid } from '../layout/polygonArea';
import { depthAt } from '../layout/terrainAt';
import { isInWater } from '../layout/waterArea';
import { WorkPrices } from './catalogue';
import { acresLabel, polygonAcres, type AreaDraft } from './draftFootprint';
import type { Plan } from './plan';
import type { WorkDraft } from './workKinds';

const MinimumPolygonPoints = 3;

export function validateArea(plan: Plan, draft: AreaDraft): string[] {
	if (draft.kind === 'gravel_bar') return [...inWater(plan, draft.points, 'The bar'), ...atMost(plan, draft.points, WorkPrices.GravelBar.maximumAcres, 'A bar'), ...depthWithin(draft.depthFeet, WorkPrices.BarDepth.minimumFeet, WorkPrices.BarDepth.maximumFeet, 'A bar sits')];
	if (draft.kind === 'deepen') return [...inWater(plan, draft.points, 'The hole'), ...atMost(plan, draft.points, WorkPrices.Deepen.maximumAcres, 'A hole'), ...depthWithin(draft.depthFeet, WorkPrices.Deepen.minimumDepthFeet, WorkPrices.Deepen.maximumDepthFeet, 'Deepen to')];
	if (draft.kind === 'lily_pads') return [...inWater(plan, draft.points, 'The lilies'), ...atMost(plan, draft.points, WorkPrices.LilyPads.maximumAcres, 'Lilies'), ...shallowEnoughForLilies(plan, draft.points)];
	return inWater(plan, draft.points, 'The dredging');
}

export function validateSnag(plan: Plan, draft: Extract<WorkDraft, { kind: 'snag' }>): string[] {
	if (!isInWater(plan.layout, draft.point)) return ['The snag must sit in water'];
	const isTooNearTheBank = feetToNearestEdge(plan.scale, draft.point, plan.layout.outline) < WorkPrices.Snag.minimumFeetFromBank;
	return isTooNearTheBank ? [`The snag must be at least ${WorkPrices.Snag.minimumFeetFromBank} ft off the bank`] : [];
}

function inWater(plan: Plan, points: LayoutPoint[], subject: string) {
	if (points.length < MinimumPolygonPoints) return ['Draw at least three points'];
	return points.every((point) => isInWater(plan.layout, point)) ? [] : [`${subject} must sit wholly in water`];
}

function atMost(plan: Plan, points: LayoutPoint[], maximumAcres: number, subject: string) {
	return polygonAcres(points, plan.plotAcres) > maximumAcres ? [`${subject} can cover at most ${acresLabel(maximumAcres)}`] : [];
}

function depthWithin(depthFeet: number, minimumFeet: number, maximumFeet: number, subject: string) {
	const isWithin = depthFeet >= minimumFeet && depthFeet <= maximumFeet;
	return isWithin ? [] : [`${subject} between ${minimumFeet} and ${maximumFeet} ft`];
}

function shallowEnoughForLilies(plan: Plan, points: LayoutPoint[]) {
	if (points.length < MinimumPolygonPoints) return [];
	const spots = [...points, polygonCentroid(points)];
	const isShallow = spots.every((point) => depthAt(plan.layout, point) <= WorkPrices.LilyPads.maximumDepthFeet);
	return isShallow ? [] : [`Lilies need water no deeper than ${WorkPrices.LilyPads.maximumDepthFeet} ft`];
}
