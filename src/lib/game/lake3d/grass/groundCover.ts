import { Group } from 'three';
import { NearDetailLayer, renderQuality } from '../renderQuality';
import { CoverGrid, coverAtlas } from './coverAtlas';
import { crossedCards } from './coverCards';
import { coverChunks } from './coverChunks';
import type { SurveyedBank } from './coverGround';
import { coverMaterial } from './coverMaterial';
import { scatterCover } from './coverScatter';
import type { CoverWind } from './coverWind';

const Chunks = { GrassMetres: 40, MarginMetres: 80, Sink: 0.04, GrassReach: 1.25, MarginReach: 1.6 } as const;
const GrassCards = { planes: 3, segments: 1, upwardNormals: 0.55, rootShade: 0.5 } as const;
const MarginCards = { planes: 3, segments: 2, upwardNormals: 0.45, rootShade: 0.45 } as const;
const Look = { Give: 1, Roughness: 0.95, Sheen: 0.12 } as const;

export function createGroundCover(bank: SurveyedBank, wind: CoverWind) {
	const quality = renderQuality();
	const plants = scatterCover(bank, bank.area, quality.coverDensity);
	const atlas = coverAtlas(bank.season, quality.coverCellPixels);
	const material = coverMaterial({ atlas, grid: CoverGrid, wind, give: Look.Give, isThinned: true, isSmoothEdged: quality.multisamples > 0, roughness: Look.Roughness, sheen: Look.Sheen });
	const chunkPlan = { material, groundAt: bank.groundAt, sink: Chunks.Sink, seed: bank.seed };
	const grass = coverChunks(plants.filter((plant) => !plant.isMarginal), { ...chunkPlan, name: 'cover-grass', metres: Chunks.GrassMetres, geometry: crossedCards(GrassCards), mostReach: Chunks.GrassReach });
	const margins = coverChunks(plants.filter((plant) => plant.isMarginal), { ...chunkPlan, name: 'cover-margin', metres: Chunks.MarginMetres, geometry: crossedCards(MarginCards), mostReach: Chunks.MarginReach });
	grass.forEach((mesh) => mesh.layers.set(NearDetailLayer));
	return new Group().add(...grass, ...margins);
}
