import type { Camera, Group } from 'three';
import { seededRandom } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { coverChunk, type ChunkPlan } from './coverChunks';
import { Tile, type CoverPlant } from './coverScatter';
import { CoverSight } from './coverSight';
import { thinningReach } from './coverThinning';
import type { CoverTiles } from './coverTiles';
import type { FieldArea } from './shoreField';

export interface ChunkSet {
	plan: ChunkPlan;
	tilesAcross: number;
	pick: (plants: CoverPlant[]) => CoverPlant[];
	group: Group;
}

interface PendingChunk {
	set: ChunkSet;
	column: number;
	row: number;
	centre: WorldPoint;
	extentMetres: number;
	sightMetres: number;
}

const Filling = { MillisecondsPerFrame: 3, SlackMetres: 24 } as const;
const ChunkSeedStride = 4096;

function chunksOver(set: ChunkSet, area: FieldArea): PendingChunk[] {
	const metres = set.tilesAcross * Tile.Metres;
	const { plan } = set;
	const extentMetres = (metres * Math.SQRT2) / 2 + Filling.SlackMetres;
	const sightMetres = thinningReach().goneBeyond * plan.mostReach + extentMetres;
	const { least, most } = area;
	const chunks: PendingChunk[] = [];
	for (let column = Math.floor(least.x / metres); column * metres < most.x; column++) {
		for (let row = Math.floor(least.z / metres); row * metres < most.z; row++) {
			chunks.push({ set, column, row, centre: { x: (column + 1 / 2) * metres, z: (row + 1 / 2) * metres }, extentMetres, sightMetres });
		}
	}
	return chunks;
}

export class CoverFilling {
	private pending: PendingChunk[];
	private tiles: CoverTiles | null;

	constructor(tiles: CoverTiles, sets: ChunkSet[], area: FieldArea) {
		this.tiles = tiles;
		this.pending = sets.flatMap((set) => chunksOver(set, area));
	}

	get isFilled() {
		return this.pending.length === 0;
	}

	fillAround(camera: Camera) {
		if (this.isFilled) return;
		const started = performance.now();
		const sight = new CoverSight(camera);
		this.pending.sort((first, second) => sight.metresTo(first.centre) - sight.metresTo(second.centre));
		while (this.pending.length > 0) {
			const next = this.pending[0];
			const isShowing = sight.isShowing(next.centre, next.extentMetres, next.sightMetres);
			const isOverBudget = performance.now() - started > Filling.MillisecondsPerFrame;
			if (!isShowing && isOverBudget) return;
			this.build(next);
			this.pending.shift();
		}
		this.tiles = null;
	}

	private build(chunk: PendingChunk) {
		const { set, column, row } = chunk;
		const { plan } = set;
		const plants = set.pick(this.plantsOf(chunk));
		const levels = coverChunk(plants, plan, seededRandom(plan.seed + column * ChunkSeedStride + row));
		if (levels) set.group.add(levels);
	}

	private plantsOf(chunk: PendingChunk): CoverPlant[] {
		const { tiles } = this;
		if (!tiles) return [];
		const { set, column, row } = chunk;
		const { tilesAcross } = set;
		const plants: CoverPlant[] = [];
		for (let across = 0; across < tilesAcross; across++) {
			for (let down = 0; down < tilesAcross; down++) plants.push(...tiles.plantsIn(column * tilesAcross + across, row * tilesAcross + down));
		}
		return plants;
	}
}
