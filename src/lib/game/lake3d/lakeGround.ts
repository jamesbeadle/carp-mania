import { BoxGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import type { WorldPoint } from './lakeFrame';

export const Heights = { Bank: 0.45, Island: 0.9, BedDeepest: 3.2, ShallowestBed: 0.8, SlabBelowTheBed: 4, SlabTopGap: 0.02 } as const;
const SlabEarth = '#4a3a26';

export function slabSides(edge: WorldPoint, bedDepth: number) {
	const depth = Heights.Bank + bedDepth + Heights.SlabBelowTheBed;
	const earth = new MeshStandardMaterial({ color: SlabEarth, roughness: 1 });
	const slab = new Mesh(new BoxGeometry(edge.x * 2, depth, edge.z * 2), [earth, earth, new MeshBasicMaterial({ visible: false }), earth, earth, earth]);
	slab.position.setY(Heights.Bank - depth / 2 - Heights.SlabTopGap);
	return slab;
}
