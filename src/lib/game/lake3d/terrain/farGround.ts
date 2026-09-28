import { Mesh, Shape, ShapeGeometry, Vector2 } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { Heights } from '../lakeGround';
import { renderQuality } from '../renderQuality';
import { createGroundMaterial, type GroundLook } from './groundMaterial';

const FarGround = { Size: 10000, Sink: 0.3, Overlap: 0.98 } as const;

function squareAround(halfWidth: number, halfDepth: number) {
	return [new Vector2(-halfWidth, -halfDepth), new Vector2(halfWidth, -halfDepth), new Vector2(halfWidth, halfDepth), new Vector2(-halfWidth, halfDepth)];
}

export function farGround(inner: WorldPoint, look: Omit<GroundLook, 'tilePixels' | 'lift'>) {
	const outer = new Shape(squareAround(FarGround.Size, FarGround.Size));
	outer.holes = [new Shape(squareAround(inner.x * FarGround.Overlap, inner.z * FarGround.Overlap))];
	const mesh = new Mesh(new ShapeGeometry(outer).rotateX(-Math.PI / 2), createGroundMaterial({ ...look, tilePixels: renderQuality().groundTilePixels, lift: FarGround.Sink }));
	mesh.position.setY(Heights.Bank - FarGround.Sink);
	mesh.receiveShadow = true;
	return mesh;
}
