import type { Group } from 'three';
import type { WorldPoint } from '../lakeFrame';
import type { ChunkPlan } from './coverChunks';
import { Tile, type CoverPlant } from './coverScatter';
import type { CoverSight } from './coverSight';
import { hiddenBeyondMetres } from './coverThinning';
import type { FieldArea } from './shoreField';

export interface ChunkSet {
	plan: ChunkPlan;
	tilesAcross: number;
	pick: (plants: CoverPlant[]) => CoverPlant[];
	group: Group;
}

export interface PendingChunk {
	set: ChunkSet;
	column: number;
	row: number;
	centre: WorldPoint;
	extentMetres: number;
	sightMetres: number;
}

const Square = { SlackMetres: 24 } as const;

function chunksOver(set: ChunkSet, area: FieldArea): PendingChunk[] {
	const metres = set.tilesAcross * Tile.Metres;
	const { plan } = set;
	const extentMetres = (metres * Math.SQRT2) / 2 + Square.SlackMetres;
	const sightMetres = hiddenBeyondMetres(plan.mostReach) + extentMetres;
	const { least, most } = area;
	const chunks: PendingChunk[] = [];
	for (let column = Math.floor(least.x / metres); column * metres < most.x; column++) {
		for (let row = Math.floor(least.z / metres); row * metres < most.z; row++) {
			chunks.push({ set, column, row, centre: { x: (column + 1 / 2) * metres, z: (row + 1 / 2) * metres }, extentMetres, sightMetres });
		}
	}
	return chunks;
}

export function partedBySight(chunks: PendingChunk[], sight: CoverSight) {
	const showing: PendingChunk[] = [];
	const hidden: PendingChunk[] = [];
	chunks.forEach((chunk) => {
		const isShowing = sight.isShowing(chunk.centre, chunk.extentMetres, chunk.sightMetres);
		(isShowing ? showing : hidden).push(chunk);
	});
	return { showing, hidden };
}

export function pendingChunksOver(sets: ChunkSet[], area: FieldArea): PendingChunk[] {
	return sets.flatMap((set) => chunksOver(set, area));
}
