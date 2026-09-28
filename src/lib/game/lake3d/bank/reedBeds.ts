import type { RandomFraction } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { WorldPoint } from '../lakeFrame';
import { crossedCards } from '../grass/coverCards';
import { coverChunks } from '../grass/coverChunks';
import { coverDepthMaterial } from '../grass/coverDepth';
import type { SurveyedBank } from '../grass/coverGround';
import { coverMaterial } from '../grass/coverMaterial';
import type { CoverWind } from '../grass/coverWind';
import { renderQuality } from '../renderQuality';
import { ReedGrid, reedAtlas } from './reedAtlas';
import { reedStands } from './reedStands';

const ReedCards = { planes: 3, segments: 4, upwardNormals: 0.35, rootShade: 0.4, splay: 0.06 } as const;
const Finish = { give: 0.55, isThinned: false, roughness: 0.85, sheen: 0.18 } as const;
const Look = { DeepestRoot: 0.7, Sink: 0.05, ChunkMetres: 60, Reach: 8 } as const;

export interface ReedBedPlan {
	lines: WorldPoint[][];
	bank: SurveyedBank;
	season: SeasonName;
	wind: CoverWind;
	random: RandomFraction;
}

export function createReedBeds(plan: ReedBedPlan) {
	const { bank } = plan;
	const quality = renderQuality();
	const stands = reedStands(plan.lines, bank.shore, bank.seed, plan.random);
	const atlas = reedAtlas(plan.season, quality.coverCellPixels);
	const material = coverMaterial(atlas, ReedGrid, plan.wind, Finish);
	const rootedAt = (point: WorldPoint) => Math.max(bank.groundAt(point), -Look.DeepestRoot);
	const shadowMaterial = quality.isCoverShadowed ? coverDepthMaterial(atlas, ReedGrid) : undefined;
	const placing = { groundAt: rootedAt, sink: Look.Sink, mostReach: Look.Reach, seed: bank.seed, shadowMaterial };
	return coverChunks(stands, { ...placing, name: 'reed-beds', metres: Look.ChunkMetres, geometry: crossedCards(ReedCards), material });
}
