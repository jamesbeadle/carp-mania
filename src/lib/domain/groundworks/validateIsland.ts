import { feetToNearestEdge } from '../layout/distanceToEdge';
import type { LayoutPoint } from '../layout/layoutTypes';
import { islandAcres, isInWater, waterAcres } from '../layout/waterArea';
import { islandCapFor, IslandRules } from './catalogue';
import { islandAcresFor, islandPolygonFor } from './islandTemplates';
import type { Plan } from './plan';
import type { WorkDraft } from './workKinds';

type IslandDraft = Extract<WorkDraft, { kind: 'island' }>;

export function validateIsland(plan: Plan, draft: IslandDraft): string[] {
	const polygon = islandPolygonFor(draft.size, draft.centre, draft.rotation, plan.plotAcres);
	return [...placementFailures(plan, polygon), ...capacityFailures(plan, draft)];
}

function placementFailures(plan: Plan, polygon: LayoutPoint[]) {
	const failures: string[] = [];
	const isWhollyInWater = polygon.every((point) => isInWater(plan.layout, point));
	if (!isWhollyInWater) failures.push('The island must sit wholly in water');
	const isTooNearTheBank = polygon.some((point) => feetToNearestEdge(plan.scale, point, plan.layout.outline) < IslandRules.MinimumFeetFromBank);
	if (isWhollyInWater && isTooNearTheBank) failures.push(`The island must be at least ${IslandRules.MinimumFeetFromBank} ft off the bank`);
	return failures;
}

function capacityFailures(plan: Plan, draft: IslandDraft) {
	const failures: string[] = [];
	const water = waterAcres(plan.layout, plan.plotAcres);
	const cap = islandCapFor(water);
	const islandsInProgress = plan.worksInProgress.filter((work) => work.kind === 'island');
	if (plan.layout.islands.length + islandsInProgress.length + 1 > cap) failures.push(`${water} acres of water takes at most ${cap} ${cap === 1 ? 'island' : 'islands'}`);
	const islandAcresAfter = islandAcres(plan.layout, plan.plotAcres) + acresOfIslands(islandsInProgress) + islandAcresFor(draft.size);
	if (islandAcresAfter > water * IslandRules.MaximumShareOfWater) failures.push('Islands may cover at most a quarter of the water');
	if (water - islandAcresFor(draft.size) < IslandRules.MinimumWaterAcres) failures.push(`The water must stay at least ${IslandRules.MinimumWaterAcres} acre`);
	return failures;
}

function acresOfIslands(drafts: WorkDraft[]) {
	return drafts.reduce((total, work) => total + (work.kind === 'island' ? islandAcresFor(work.size) : 0), 0);
}
