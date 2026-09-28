import { Group } from 'three';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { ClearSpot } from './bank/facilityGrounds';
import { createMarginPlants } from './bank/marginPlants';
import { createGrassTufts } from './grass/grassTufts';
import type { WorldPoint } from './lakeFrame';
import type { Country } from './terrain/lakeLand';
import { createHedgerows } from './trees/hedgerows';
import { Trees } from './trees/trees3d';
import type { Woodland } from './trees/treePlanting';
import { WindSway } from './trees/windSway';

export interface VegetationPlan {
	woodland: Woodland;
	outline: WorldPoint[];
	islands: WorldPoint[][];
	openings: WorldPoint[];
	reedLines: WorldPoint[][];
	keepClear: ClearSpot[];
	plotEdge: WorldPoint | null;
	season: SeasonName;
	seed: number;
	groundAt: (point: WorldPoint) => number;
	country: Country | null;
}

const GrassGive = 2.5;

export class Vegetation {
	readonly group = new Group();
	private readonly trees: Trees;
	private readonly grassWind = new WindSway(GrassGive, 0);

	constructor(plan: VegetationPlan) {
		this.trees = new Trees(plan.woodland, plan.season, plan.groundAt);
		this.group.add(this.trees.group, createGrassTufts(plan, this.grassWind));
		this.group.add(createMarginPlants({ shores: [plan.outline, ...plan.islands], reedLines: plan.reedLines, openings: plan.openings, season: plan.season, seed: plan.seed, groundAt: plan.groundAt }, this.grassWind));
		const { country } = plan;
		const hedgerows = country ? [createHedgerows({ country, season: plan.season, seed: plan.seed, groundAt: plan.groundAt })] : [];
		this.group.add(...hedgerows);
	}

	blow(timeSeconds: number, windStrength: number) {
		this.trees.blow(timeSeconds, windStrength);
		this.grassWind.blow(timeSeconds, windStrength);
	}
}
