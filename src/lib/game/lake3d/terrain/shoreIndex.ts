import type { WorldPoint } from '../lakeFrame';
import { cellGridOf, type CellGrid } from './shoreCells';
import { outwardAt, shoreRingOf, type ShoreEdge, type ShoreRing } from './shoreRings';

export interface ShoreHit {
	distance: number;
	isWater: boolean;
	isIsland: boolean;
}

interface Closest {
	distance: number;
	edge: number;
	along: number;
}

const CellMetres = 6;

export class ShoreIndex {
	private readonly rings: ShoreRing[];
	private readonly edges: ShoreEdge[];
	private readonly grid: CellGrid;

	constructor(outline: WorldPoint[], islands: WorldPoint[][], reachMetres: number) {
		this.rings = [shoreRingOf(outline, false, 0), ...islands.map((island, index) => shoreRingOf(island, true, index + 1))];
		this.edges = this.rings.flatMap((ring) => ring.edges);
		this.grid = cellGridOf(this.edges, CellMetres, reachMetres + CellMetres);
	}

	nearest(point: WorldPoint, reachMetres: number): ShoreHit | null {
		const { originX, originZ, across, down } = this.grid;
		const column = Math.floor((point.x - originX) / CellMetres);
		const row = Math.floor((point.z - originZ) / CellMetres);
		if (column < 0 || row < 0 || column >= across || row >= down) return null;
		const firstRing = this.grid.stepsToAnEdge[row * across + column];
		if ((firstRing - 1) * CellMetres > reachMetres) return null;
		const closest: Closest = { distance: Infinity, edge: -1, along: 0 };
		for (let ring = firstRing; ; ring++) {
			this.searchRing(point, column, row, ring, closest);
			const isSettled = closest.distance <= ring * CellMetres || ring * CellMetres > reachMetres;
			if (isSettled) break;
		}
		return closest.distance > reachMetres ? null : this.hitOf(point, closest);
	}

	private searchRing(point: WorldPoint, column: number, row: number, ring: number, closest: Closest) {
		for (let across = -ring; across <= ring; across++) {
			this.searchCell(point, column + across, row - ring, closest);
			if (ring > 0) this.searchCell(point, column + across, row + ring, closest);
		}
		for (let down = 1 - ring; down < ring; down++) {
			this.searchCell(point, column - ring, row + down, closest);
			this.searchCell(point, column + ring, row + down, closest);
		}
	}

	private searchCell(point: WorldPoint, column: number, row: number, closest: Closest) {
		const { across, down, edgesIn } = this.grid;
		if (column < 0 || row < 0 || column >= across || row >= down) return;
		for (const id of edgesIn[row * across + column]) this.tryEdge(point, id, closest);
	}

	private tryEdge(point: WorldPoint, id: number, closest: Closest) {
		const edge = this.edges[id];
		const along = Math.min(1, Math.max(0, ((point.x - edge.startX) * edge.spanX + (point.z - edge.startZ) * edge.spanZ) / edge.lengthSquared));
		const awayX = point.x - edge.startX - along * edge.spanX;
		const awayZ = point.z - edge.startZ - along * edge.spanZ;
		const distance = Math.sqrt(awayX * awayX + awayZ * awayZ);
		if (distance >= closest.distance) return;
		closest.distance = distance;
		closest.edge = id;
		closest.along = along;
	}

	private hitOf(point: WorldPoint, closest: Closest): ShoreHit {
		const edge = this.edges[closest.edge];
		const ring = this.rings[edge.ring];
		const outward = outwardAt(ring, edge, closest.along);
		const awayX = point.x - edge.startX - closest.along * edge.spanX;
		const awayZ = point.z - edge.startZ - closest.along * edge.spanZ;
		const isInsideRing = awayX * outward.x + awayZ * outward.z < 0;
		return { distance: closest.distance, isWater: isInsideRing !== ring.isIsland, isIsland: ring.isIsland };
	}
}
