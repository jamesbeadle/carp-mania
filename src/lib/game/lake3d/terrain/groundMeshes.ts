import { Mesh, type BufferGeometry, type Material } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { renderQuality } from '../renderQuality';
import { createGroundMaterial, type GroundLook } from './groundMaterial';
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
	look: Omit<GroundLook, 'tilePixels'>;
}

const FinestSpacingMetres = 0.6;

function groundMesh(geometry: BufferGeometry, material: Material) {
	const mesh = new Mesh(geometry, material);
	mesh.receiveShadow = true;
	return mesh;
}

export function createGroundMeshes(shape: TerrainShape, plan: GroundPlan) {
	const quality = renderQuality();
	const { half } = plan;
	const size: TerrainSize = { width: half.x * 2, depth: half.z * 2, metresPerCell: plan.metresPerCell, mostCells: plan.mostCells };
	const cellMetres = Math.max(size.width / cellsAlong(size.width, size), size.depth / cellsAlong(size.depth, size));
	const band = shoreBandFor(cellMetres);
	const material = createGroundMaterial({ ...plan.look, tilePixels: quality.groundTilePixels });
	const { outline, islands } = shape.plan;
	const rings = [{ points: outline, isIsland: false }, ...islands.map((points) => ({ points, isIsland: true }))];
	const isFine = quality.shoreSpacingMetres <= FinestSpacingMetres;
	const offsets = rowOffsets(band, isFine);
	const ribbon = createRibbonGeometry({ rings, spacing: quality.shoreSpacingMetres, offsets, edge: plan.plotEdge, heightAt: (point) => shape.heightAt(point) });
	return [groundMesh(createTerrainGeometry(shape, size, band), material), groundMesh(ribbon, material)];
}
