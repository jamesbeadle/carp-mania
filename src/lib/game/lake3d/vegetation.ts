import { Group } from 'three';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { ClearSpot } from './bank/facilityGrounds';
import { createGrassTufts } from './grass/grassTufts';
import type { WorldPoint } from './lakeFrame';
import { Trees } from './trees/trees3d';
import type { Woodland } from './trees/treePlanting';
import { WindSway } from './trees/windSway';

export interface VegetationPlan {
	woodland: Woodland;
	outline: WorldPoint[];
	keepClear: ClearSpot[];
	plotEdge: WorldPoint | null;
	season: SeasonName;
	seed: number;
	groundAt: (point: WorldPoint) => number;
}

const GrassGive = 2.5;

export class Vegetation {
	readonly group = new Group();
	private readonly trees: Trees;
	private readonly grassWind = new WindSway(GrassGive, 0);

	constructor(plan: VegetationPlan) {
		this.trees = new Trees(plan.woodland, plan.season, plan.groundAt);
		this.group.add(this.trees.group, createGrassTufts(plan, this.grassWind));
	}

	blow(timeSeconds: number, windStrength: number) {
		this.trees.blow(timeSeconds, windStrength);
		this.grassWind.blow(timeSeconds, windStrength);
	}
}
