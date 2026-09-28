import { Float32BufferAttribute, MathUtils, PlaneGeometry } from 'three';
import type { ShoreBand } from './shoreBand';
import type { ShoreHit } from './shoreIndex';
import type { TerrainShape } from './terrainShape';

export interface TerrainSize {
	width: number;
	depth: number;
	metresPerCell: number;
	mostCells: number;
}

const FewestCells = 8;

export function cellsAlong(metres: number, size: TerrainSize) {
	return Math.min(size.mostCells, Math.max(FewestCells, Math.round(metres / size.metresPerCell)));
}

function sinkFor(hit: ShoreHit | null, band: ShoreBand) {
	if (!hit) return 0;
	const core = hit.isWater ? band.waterCore : band.landCore;
	return band.sinkMetres * (1 - MathUtils.smoothstep(hit.distance, core, core + band.fade));
}

function slopeNormals(heights: Float32Array, columns: number, rows: number, cell: { x: number; z: number }) {
	const normals = new Float32Array(heights.length * 3);
	const heightOf = (column: number, row: number) => heights[Math.min(rows, Math.max(0, row)) * (columns + 1) + Math.min(columns, Math.max(0, column))];
	for (let row = 0; row <= rows; row++) {
		for (let column = 0; column <= columns; column++) {
			const eastward = (heightOf(column + 1, row) - heightOf(column - 1, row)) / (2 * cell.x);
			const southward = (heightOf(column, row + 1) - heightOf(column, row - 1)) / (2 * cell.z);
			const length = Math.hypot(eastward, 1, southward);
			normals.set([-eastward / length, 1 / length, -southward / length], (row * (columns + 1) + column) * 3);
		}
	}
	return normals;
}

function unburiedIndex(index: ArrayLike<number>, isBuried: Uint8Array) {
	const kept: number[] = [];
	for (let corner = 0; corner < index.length; corner += 3) {
		const isHidden = isBuried[index[corner]] && isBuried[index[corner + 1]] && isBuried[index[corner + 2]];
		if (!isHidden) kept.push(index[corner], index[corner + 1], index[corner + 2]);
	}
	return kept;
}

export function createTerrainGeometry(shape: TerrainShape, size: TerrainSize, band: ShoreBand) {
	const columns = cellsAlong(size.width, size);
	const rows = cellsAlong(size.depth, size);
	const geometry = new PlaneGeometry(size.width, size.depth, columns, rows).rotateX(-Math.PI / 2);
	const positions = geometry.getAttribute('position');
	const heights = new Float32Array(positions.count);
	const isBuried = new Uint8Array(positions.count);
	for (let index = 0; index < positions.count; index++) {
		const surface = shape.surfaceAt({ x: positions.getX(index), z: positions.getZ(index) });
		const sink = sinkFor(surface.hit, band);
		heights[index] = surface.height;
		isBuried[index] = sink >= band.sinkMetres ? 1 : 0;
		positions.setY(index, surface.height - sink);
	}
	geometry.setAttribute('normal', new Float32BufferAttribute(slopeNormals(heights, columns, rows, { x: size.width / columns, z: size.depth / rows }), 3));
	const index = geometry.getIndex();
	if (index) geometry.setIndex(unburiedIndex(index.array, isBuried));
	return geometry;
}
