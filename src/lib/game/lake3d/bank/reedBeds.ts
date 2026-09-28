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

const ReedCards = { planes: 3, segments: 4, upwardNormals: 0.35, rootShade: 0.4 } as const;
const Look = { Give: 0.55, Roughness: 0.85, Sheen: 0.18, DeepestRoot: 0.7, Sink: 0.05, ChunkMetres: 60, Reach: 8 } as const;

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
	const material = coverMaterial({ atlas, grid: ReedGrid, wind: plan.wind, give: Look.Give, isThinned: false, isSmoothEdged: quality.multisamples > 0, roughness: Look.Roughness, sheen: Look.Sheen });
	const rootedAt = (point: WorldPoint) => Math.max(bank.groundAt(point), -Look.DeepestRoot);
	return coverChunks(stands, { name: 'reed-beds', metres: Look.ChunkMetres, geometry: crossedCards(ReedCards), material, groundAt: rootedAt, sink: Look.Sink, mostReach: Look.Reach, seed: bank.seed, shadowMaterial: quality.isCoverShadowed ? coverDepthMaterial(atlas, ReedGrid) : undefined });
}
