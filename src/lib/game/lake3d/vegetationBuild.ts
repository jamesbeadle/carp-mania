import { seededRandom } from '$lib/domain/random';
import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import { createLakeFeatures } from './bank/lakeFeatures3d';
import { createBushes } from './bushes/bushes3d';
import { untilTheNextFrame } from './frameYield';
import { surveyBank, type BankPlan } from './grass/coverGround';
import { CoverWind } from './grass/coverWind';
import { growGroundCover } from './grass/groundCover';
import type { LakeFrame } from './lakeFrame';
import { Trees } from './trees/trees3d';
import type { Woodland } from './trees/treePlanting';
import { gatherTreeStock } from './trees/treeStock';
import { Vegetation } from './vegetation';

export interface VegetationPlan extends BankPlan {
	woodland: Woodland;
	layout: LakeLayout;
	frame: LakeFrame;
}

const BushSeedStep = 101;

export async function buildVegetation(plan: VegetationPlan, signal?: AbortSignal): Promise<Vegetation> {
	const coverWind = new CoverWind();
	const stock = await gatherTreeStock(plan.season, signal);
	await untilTheNextFrame(signal);
	const trees = new Trees(plan.woodland, plan.season, plan.groundAt, stock);
	await untilTheNextFrame(signal);
	const bank = surveyBank(plan);
	await untilTheNextFrame(signal);
	const features = createLakeFeatures({ layout: plan.layout, frame: plan.frame, bank, wind: coverWind });
	const { woodland } = plan;
	const bushes = createBushes(woodland.onTheBank, bank, coverWind, seededRandom(plan.seed + BushSeedStep));
	await untilTheNextFrame(signal);
	const cover = await growGroundCover(bank, coverWind, signal);
	return new Vegetation(trees, coverWind, [cover, features, ...bushes]);
}
