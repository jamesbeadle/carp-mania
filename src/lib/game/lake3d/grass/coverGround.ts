import type { SeasonName } from '$lib/domain/world/worldClock';
import type { ClearSpot } from '../bank/facilityGrounds';
import type { WorldPoint } from '../lakeFrame';
import type { CoverGround } from './coverSite';
import { ShoreField, type FieldArea } from './shoreField';
import { swimClearingsFor } from './swimClearings';

export interface BankPlan {
	outline: WorldPoint[];
	islands: WorldPoint[][];
	pegs: WorldPoint[];
	keepClear: ClearSpot[];
	plotEdge: WorldPoint | null;
	groundAt: (point: WorldPoint) => number;
	season: SeasonName;
	seed: number;
}

export interface SurveyedBank extends CoverGround {
	area: FieldArea;
}

const ReachBeyondTheWater = 95;

function areaAround(outline: WorldPoint[], plotEdge: WorldPoint | null): FieldArea {
	const xs = outline.map((point) => point.x);
	const zs = outline.map((point) => point.z);
	const least = { x: Math.min(...xs) - ReachBeyondTheWater, z: Math.min(...zs) - ReachBeyondTheWater };
	const most = { x: Math.max(...xs) + ReachBeyondTheWater, z: Math.max(...zs) + ReachBeyondTheWater };
	if (!plotEdge) return { least, most };
	return { least: { x: Math.max(least.x, -plotEdge.x), z: Math.max(least.z, -plotEdge.z) }, most: { x: Math.min(most.x, plotEdge.x), z: Math.min(most.z, plotEdge.z) } };
}

export function surveyBank(plan: BankPlan): SurveyedBank {
	const water = { outline: plan.outline, islands: plan.islands };
	const area = areaAround(plan.outline, plan.plotEdge);
	const facilities = plan.keepClear.filter((spot) => !plan.pegs.includes(spot.point));
	return { area, shore: new ShoreField(area, water), swims: swimClearingsFor(plan.pegs, water), facilities, plotEdge: plan.plotEdge, groundAt: plan.groundAt, season: plan.season, seed: plan.seed };
}
