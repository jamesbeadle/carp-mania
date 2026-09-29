import { Mesh, type BufferGeometry, type Material } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { NearDetailLayer, renderQuality } from '../renderQuality';
import { createGroundMaterial, type GroundLook } from './groundMaterial';
import { splitIntoPieces, type GroundPiece, type PieceKey } from './groundPieces';
import { rowOffsets } from './ribbonRows';
import { shoreBandFor } from './shoreBand';
import { createRibbonGeometry } from './shoreRibbon';
import { cellsAlong, createTerrainGeometry, type TerrainSize } from './terrainMesh';
import type { TerrainShape } from './terrainShape';

export interface GroundPlan {
	half: WorldPoint;
	metresPerCell: number;
	mostCells: number;
	plotEdge: WorldPoint | null;
	look: GroundLook;
}

const FinestSpacingMetres = 0.8;
const Tiling = { Across: 2, Sectors: 4 } as const;

function tileKey(half: WorldPoint): PieceKey {
	const tileOf = (value: number, reach: number) => Math.min(Tiling.Across - 1, Math.max(0, Math.floor(((value + reach) / (reach * 2)) * Tiling.Across)));
	return (x, z, isUnderwater) => (isUnderwater ? 0 : 1 + tileOf(x, half.x) + tileOf(z, half.z) * Tiling.Across);
}

function sectorKey(shape: TerrainShape): PieceKey {
	const { least, most } = shape.lakeBounds;
	const centreX = (least.x + most.x) / 2;
	const centreZ = (least.z + most.z) / 2;
	return (x, z) => Math.floor(((Math.atan2(z - centreZ, x - centreX) + Math.PI) / (Math.PI * 2)) * Tiling.Sectors) % Tiling.Sectors;
}

function meshesOf(pieces: GroundPiece[], material: Material) {
	return pieces.map(({ geometry, isUnderwater }) => {
		const mesh = new Mesh(geometry, material);
		mesh.receiveShadow = true;
		if (isUnderwater) mesh.layers.set(NearDetailLayer);
		return mesh;
	});
}

function indexOf(geometry: BufferGeometry) {
	return geometry.getIndex()?.array ?? [];
}

export function createGroundMeshes(shape: TerrainShape, plan: GroundPlan) {
	const quality = renderQuality();
	const { half } = plan;
	const size: TerrainSize = { width: half.x * 2, depth: half.z * 2, metresPerCell: plan.metresPerCell, mostCells: plan.mostCells };
	const cellMetres = Math.max(size.width / cellsAlong(size.width, size), size.depth / cellsAlong(size.depth, size));
	const band = shoreBandFor(cellMetres);
	const material = createGroundMaterial(plan.look);
	const { outline, islands } = shape.plan;
	const rings = [{ points: outline, isIsland: false }, ...islands.map((points) => ({ points, isIsland: true }))];
	const offsets = rowOffsets(band, quality.shoreSpacingMetres <= FinestSpacingMetres);
	const ribbon = createRibbonGeometry({ rings, spacing: quality.shoreSpacingMetres, offsets, edge: plan.plotEdge, heightAt: (point) => shape.heightAt(point) });
	const grid = createTerrainGeometry(shape, size, band);
	return [...meshesOf(splitIntoPieces(grid, indexOf(grid), tileKey(half)), material), ...meshesOf(splitIntoPieces(ribbon, indexOf(ribbon), sectorKey(shape)), material)];
}
