import { Group } from 'three';
import { seededRandom } from '$lib/domain/random';
import { isAreaFeature, isReedLine, isSnag, type LakeLayout } from '$lib/domain/layout/layoutTypes';
import type { SurveyedBank } from '../grass/coverGround';
import type { CoverWind } from '../grass/coverWind';
import { worldPointOf, type LakeFrame } from '../lakeFrame';
import { renderQuality } from '../renderQuality';
import { smoothWorldOutline } from '../worldShapes';
import { createFallenTree } from './fallenTree';
import { createLilyBeds } from './lilyPads';
import { createReedBeds } from './reedBeds';

export interface FeaturePlan {
	layout: LakeLayout;
	frame: LakeFrame;
	bank: SurveyedBank;
	wind: CoverWind;
}

const LilyPadKind = 'lily_pads';

export function createLakeFeatures(plan: FeaturePlan) {
	const { layout, frame, bank } = plan;
	const random = seededRandom(bank.seed);
	const lines = layout.features.filter(isReedLine).map((line) => line.points.map((point) => worldPointOf(frame, point)));
	const lilyAreas = layout.features.filter(isAreaFeature).filter((area) => area.kind === LilyPadKind);
	const { cover } = renderQuality();
	const lilies = createLilyBeds(lilyAreas.map((area) => smoothWorldOutline(frame, area.points)), bank.season, cover.density, random);
	const snags = layout.features.filter(isSnag).map((snag) => createFallenTree(worldPointOf(frame, snag.point), bank.shore, random));
	return new Group().add(...createReedBeds({ lines, bank, season: bank.season, wind: plan.wind, random }), lilies, ...snags);
}
