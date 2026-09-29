import { swimPoint } from '$lib/domain/layout/swimRules';
import type { Lake, Swim } from '$lib/domain/types';
import type { StageConditions } from '../../sky/stageConditions';
import type { FishToShow } from '../fish/roamingFish';
import type { LakeWorldPlan } from '../lakeWorld';

export interface LakeScenePlan {
	lake: Lake;
	swims: Swim[];
	fish: FishToShow[];
	conditions: StageConditions;
	isDiorama?: boolean;
}

const LakeSeedStride = 7919;

function seedOf(lakeId: string) {
	return lakeId.length * LakeSeedStride;
}

export function worldPlanOf(plan: LakeScenePlan): LakeWorldPlan {
	const { lake, swims } = plan;
	const { season } = plan.conditions;
	return { layout: lake.layout, plotAcres: Number(lake.plot_acres), transparencyPercent: Number(lake.transparency), season, pegs: swims.map((swim) => swimPoint(swim)), seed: seedOf(lake.id), isDiorama: plan.isDiorama ?? false };
}
