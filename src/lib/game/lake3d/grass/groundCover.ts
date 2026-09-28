import { Group } from 'three';
import { coverQuality, NearDetailLayer } from '../renderQuality';
import { CoverGrid, coverAtlas } from './coverAtlas';
import { crossedCards } from './coverCards';
import { coverChunks } from './coverChunks';
import type { SurveyedBank } from './coverGround';
import { coverMaterial } from './coverMaterial';
import { scatterCover } from './coverScatter';
import type { CoverWind } from './coverWind';
import { createWornPatches } from './wornPatches';
import { createMarginBand } from '../margins/marginBand';

const Chunks = { GrassMetres: 56, MarginMetres: 120, Sink: 0.05, GrassReach: 1.25, MarginReach: 2.2 } as const;
const GrassCards = { planes: 3, segments: 1, upwardNormals: 0.8, rootShade: 0.8, splay: 0.1 } as const;
const MarginCards = { planes: 3, segments: 2, upwardNormals: 0.5, rootShade: 0.62, splay: 0.12 } as const;
const Finish = { give: 1, isThinned: true, roughness: 0.95, sheen: 0.12 } as const;
const GrassFinish = { ...Finish, isFadedFromAbove: true } as const;

export function createGroundCover(bank: SurveyedBank, wind: CoverWind) {
	const cover = coverQuality();
	const plants = scatterCover(bank, bank.area, cover.density);
	const atlas = coverAtlas(bank.season, cover.cellPixels);
	const material = coverMaterial(atlas, CoverGrid, wind, Finish);
	const chunkPlan = { material, groundAt: bank.groundAt, sink: Chunks.Sink, seed: bank.seed };
	const grassMaterial = coverMaterial(atlas, CoverGrid, wind, GrassFinish);
	const grassPlan = { ...chunkPlan, material: grassMaterial, name: 'cover-grass', metres: Chunks.GrassMetres, geometry: crossedCards(GrassCards), mostReach: Chunks.GrassReach };
	const marginPlan = { ...chunkPlan, name: 'cover-margin', metres: Chunks.MarginMetres, geometry: crossedCards(MarginCards), mostReach: Chunks.MarginReach };
	const grass = coverChunks(plants.filter((plant) => !plant.isMarginal), grassPlan);
	const margins = coverChunks(plants.filter((plant) => plant.isMarginal), marginPlan);
	grass.forEach((levels) => levels.traverse((part) => part.layers.set(NearDetailLayer)));
	return new Group().add(...grass, ...margins, createMarginBand(bank), createWornPatches(bank));
}
