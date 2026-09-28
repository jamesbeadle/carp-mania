import { Color, Float32BufferAttribute, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';
import type { BedType } from '$lib/domain/types';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { speckledTexture } from '../speckledTexture';
import { TerrainColours } from './terrainColours';
import type { TerrainShape } from './terrainShape';

export interface TerrainSize {
	width: number;
	depth: number;
	metresPerCell: number;
	mostCells: number;
}

const DetailTexture = { base: '#e8e8e8', flecks: ['#ffffff', '#cfcfcf', '#bdbdbd', '#f4f4f4'], fleckCount: 9000, largestFleck: 2, metresPerTile: 3, seed: 5 };

const GroundRelief = 1.2;

function cellsAlong(metres: number, size: TerrainSize) {
	return Math.min(size.mostCells, Math.max(8, Math.round(metres / size.metresPerCell)));
}

export function createTerrainMesh(shape: TerrainShape, size: TerrainSize, look: { season: SeasonName; bed: BedType; bedDepth: number }) {
	const geometry = new PlaneGeometry(size.width, size.depth, cellsAlong(size.width, size), cellsAlong(size.depth, size)).rotateX(-Math.PI / 2);
	const positions = geometry.getAttribute('position');
	const colours = new Float32Array(positions.count * 3);
	const painter = new TerrainColours(look.season, look.bed, look.bedDepth);
	const colour = new Color();
	for (let index = 0; index < positions.count; index++) {
		const point = { x: positions.getX(index), z: positions.getZ(index) };
		const sample = shape.sampleAt(point);
		positions.setY(index, sample.height);
		painter.at(point, sample, colour).toArray(colours, index * 3);
	}
	geometry.setAttribute('color', new Float32BufferAttribute(colours, 3));
	geometry.computeVertexNormals();
	const detail = speckledTexture(DetailTexture);
	const material = new MeshStandardMaterial({ vertexColors: true, map: detail, bumpMap: detail, bumpScale: GroundRelief, roughness: 0.95 });
	const mesh = new Mesh(geometry, material);
	mesh.receiveShadow = true;
	return mesh;
}
