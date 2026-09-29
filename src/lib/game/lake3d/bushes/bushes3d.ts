import type { RandomFraction } from '$lib/domain/random';
import { coverChunks } from '../grass/coverChunks';
import { coverDepthMaterial } from '../grass/coverDepth';
import type { SurveyedBank } from '../grass/coverGround';
import { coverMaterial } from '../grass/coverMaterial';
import type { CoverWind } from '../grass/coverWind';
import { coverQuality } from '../renderQuality';
import type { PlantedTree } from '../trees/treePlanting';
import { BushGrid, bushAtlas } from './bushAtlas';
import { plantBushes } from './bushPlanting';
import { bushBlob } from './bushShape';

const Finish = { give: 0.12, isThinned: false, roughness: 0.92, sheen: 0.1 } as const;
const Look = { Sink: 0.12, ChunkMetres: 200, Reach: 3 } as const;

export function createBushes(trees: PlantedTree[], bank: SurveyedBank, wind: CoverWind, random: RandomFraction) {
	const cover = coverQuality();
	const bushes = plantBushes(trees, bank, cover.density, random);
	const atlas = bushAtlas(bank.season, cover.cellPixels);
	const material = coverMaterial(atlas, BushGrid, wind, Finish);
	const shadowMaterial = cover.isShadowed ? coverDepthMaterial(atlas, BushGrid) : undefined;
	const placing = { groundAt: bank.groundAt, sink: Look.Sink, mostReach: Look.Reach, seed: bank.seed, shadowMaterial };
	return coverChunks(bushes, { ...placing, name: 'cover-bushes', metres: Look.ChunkMetres, geometry: bushBlob(), material });
}
