import type { Camera } from 'three';
import { seededRandom } from '$lib/domain/random';
import { coverChunk } from './coverChunks';
import type { CoverPlant } from './coverScatter';
import { CoverSight } from './coverSight';
import { Seeding, type CoverTiles } from './coverTiles';
import { partedBySight, pendingChunksOver, type ChunkSet, type PendingChunk } from './pendingChunks';
import type { FieldArea } from './shoreField';

export type { ChunkSet } from './pendingChunks';

const Filling = { MillisecondsPerFrame: 3 } as const;

export class CoverFilling {
	private pending: PendingChunk[];
	private tiles: CoverTiles | null;

	constructor(tiles: CoverTiles, sets: ChunkSet[], area: FieldArea) {
		this.tiles = tiles;
		this.pending = pendingChunksOver(sets, area);
	}

	get isFilled() {
		return this.pending.length === 0;
	}

	fillAround(camera: Camera) {
		if (this.isFilled) return;
		const started = performance.now();
		const sight = new CoverSight(camera);
		this.pending.sort((first, second) => sight.metresTo(first.centre) - sight.metresTo(second.centre));
		const { showing, hidden } = partedBySight(this.pending, sight);
		showing.forEach((chunk) => this.build(chunk));
		this.pending = hidden;
		this.buildNearestWithin(started);
	}

	private buildNearestWithin(started: number) {
		let built = 0;
		for (const chunk of this.pending) {
			const isOverBudget = performance.now() - started > Filling.MillisecondsPerFrame;
			if (isOverBudget) break;
			this.build(chunk);
			built++;
		}
		this.pending.splice(0, built);
		if (this.isFilled) this.tiles = null;
	}

	private build(chunk: PendingChunk) {
		const { set, column, row } = chunk;
		const { plan } = set;
		const plants = set.pick(this.plantsOf(chunk));
		const levels = coverChunk(plants, plan, seededRandom(plan.seed + column * Seeding.ColumnStride + row));
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
