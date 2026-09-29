import { Group, type Camera } from 'three';
import { coverQuality, NearDetailLayer } from '../renderQuality';
import { createMarginBand } from '../margins/marginBand';
import { CoverGrid, coverAtlas } from './coverAtlas';
import { crossedCards } from './coverCards';
import { CoverFilling, type ChunkSet } from './coverFilling';
import type { SurveyedBank } from './coverGround';
import { coverMaterial } from './coverMaterial';
import type { CoverPlant } from './coverScatter';
import { CoverTiles } from './coverTiles';
import type { CoverWind } from './coverWind';
import { createSward } from './sward';
import { createWornPatches } from './wornPatches';

const Chunks = { GrassTiles: 7, MarginTiles: 15, Sink: 0.05, GrassReach: 1.25, MarginReach: 2.2 } as const;
const GrassCards = { planes: 1, segments: 1, upwardNormals: 0.8, rootShade: 0.8, splay: 0 } as const;
const MarginCards = { planes: 3, segments: 2, upwardNormals: 0.5, rootShade: 0.62, splay: 0.12 } as const;
const Finish = { give: 1, isThinned: true, roughness: 0.95, sheen: 0.12 } as const;
const GrassFinish = { ...Finish, isFadedFromAbove: true, isFacingCamera: true } as const;

function facingPlant(plant: CoverPlant): CoverPlant {
	return { ...plant, turn: 0 };
}

function grassAmong(plants: CoverPlant[]) {
	return plants.filter((plant) => !plant.isMarginal).map(facingPlant);
}

function marginsAmong(plants: CoverPlant[]) {
	return plants.filter((plant) => plant.isMarginal);
}

export class GroundCover {
	readonly group = new Group();
	private readonly filling: CoverFilling;

	constructor(bank: SurveyedBank, wind: CoverWind) {
		const cover = coverQuality();
		const atlas = coverAtlas(bank.season, cover.cellPixels);
		const material = coverMaterial(atlas, CoverGrid, wind, Finish);
		const chunkPlan = { material, groundAt: bank.groundAt, sink: Chunks.Sink, seed: bank.seed };
		const grassMaterial = coverMaterial(atlas, CoverGrid, wind, GrassFinish);
		const grassPlan = { ...chunkPlan, material: grassMaterial, name: 'cover-grass', geometry: crossedCards(GrassCards), mostReach: Chunks.GrassReach, detailLayer: NearDetailLayer };
		const marginPlan = { ...chunkPlan, name: 'cover-margin', geometry: crossedCards(MarginCards), mostReach: Chunks.MarginReach };
		const grass: ChunkSet = { plan: grassPlan, tilesAcross: Chunks.GrassTiles, pick: grassAmong, group: new Group() };
		const margins: ChunkSet = { plan: marginPlan, tilesAcross: Chunks.MarginTiles, pick: marginsAmong, group: new Group() };
		this.filling = new CoverFilling(new CoverTiles(bank, bank.area, cover.density), [grass, margins], bank.area);
		this.group.add(createSward(bank, atlas, CoverGrid, wind), grass.group, margins.group, createMarginBand(bank), createWornPatches(bank));
	}

	get isFilled() {
		return this.filling.isFilled;
	}

	fillAround(camera: Camera) {
		this.filling.fillAround(camera);
	}
}
