import { Mesh, MeshStandardMaterial, Shape, ShapeGeometry, Vector2 } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { Heights } from '../lakeGround';

const FarGround = { Size: 10000, Sink: 0.3, Colour: '#44602a', Overlap: 0.98 } as const;

function squareAround(halfWidth: number, halfDepth: number) {
	return [new Vector2(-halfWidth, -halfDepth), new Vector2(halfWidth, -halfDepth), new Vector2(halfWidth, halfDepth), new Vector2(-halfWidth, halfDepth)];
}

export function farGround(inner: WorldPoint) {
	const outer = new Shape(squareAround(FarGround.Size, FarGround.Size));
	outer.holes = [new Shape(squareAround(inner.x * FarGround.Overlap, inner.z * FarGround.Overlap))];
	const mesh = new Mesh(new ShapeGeometry(outer).rotateX(-Math.PI / 2), new MeshStandardMaterial({ color: FarGround.Colour, roughness: 1 }));
	mesh.position.setY(Heights.Bank - FarGround.Sink);
	mesh.receiveShadow = true;
	return mesh;
}
