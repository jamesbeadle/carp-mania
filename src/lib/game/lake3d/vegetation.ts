import { Group } from 'three';
import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import { createLakeFeatures } from './bank/lakeFeatures3d';
import { surveyBank, type BankPlan } from './grass/coverGround';
import { CoverWind } from './grass/coverWind';
import { createGroundCover } from './grass/groundCover';
import type { LakeFrame } from './lakeFrame';
import { Trees } from './trees/trees3d';
import type { Woodland } from './trees/treePlanting';

export interface VegetationPlan extends BankPlan {
	woodland: Woodland;
	layout: LakeLayout;
	frame: LakeFrame;
}

export class Vegetation {
	readonly group = new Group();
	private readonly trees: Trees;
	private readonly coverWind = new CoverWind();

	constructor(plan: VegetationPlan) {
		this.trees = new Trees(plan.woodland, plan.season, plan.groundAt);
		const bank = surveyBank(plan);
		const features = createLakeFeatures({ layout: plan.layout, frame: plan.frame, bank, wind: this.coverWind });
		this.group.add(this.trees.group, createGroundCover(bank, this.coverWind), features);
	}

	blow(timeSeconds: number, windStrength: number) {
		this.trees.blow(timeSeconds, windStrength);
		this.coverWind.blow(timeSeconds, windStrength);
	}
}
