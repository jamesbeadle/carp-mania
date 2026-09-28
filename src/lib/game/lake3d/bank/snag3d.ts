import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, type Material } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { barkTexture } from '../trees/barkTexture';

const SnagColour = '#4a3a2c';
const Trunk = { Length: 7, Butt: 0.26, Tip: 0.1, Sides: 8, LeastTilt: 0.18, TiltRange: 0.2, Sink: 0.45 } as const;
const Branches = { Count: 6, LeastLength: 0.9, LengthRange: 1.6, Radius: 0.06, LeastLean: 0.3, LeanRange: 0.7 } as const;
const Roots = { Count: 7, Length: 1.3, Radius: 0.07, Splay: 1.2 } as const;

function limb(length: number, radius: number, material: Material) {
	const geometry = new CylinderGeometry(radius * 0.45, radius, length, 6).translate(0, length / 2, 0);
	return new Mesh(geometry, material);
}

function branchesAlong(material: Material, random: () => number) {
	return Array.from({ length: Branches.Count }, (_, index) => {
		const branch = limb(Branches.LeastLength + random() * Branches.LengthRange, Branches.Radius, material);
		branch.position.set(0, (0.25 + (index / Branches.Count) * 0.7) * Trunk.Length, 0);
		branch.rotation.set((random() - 0.5) * Branches.LeanRange, random() * Math.PI * 2, (index % 2 ? 1 : -1) * (Branches.LeastLean + random() * Branches.LeanRange));
		return branch;
	});
}

function rootPlate(material: Material, random: () => number) {
	return Array.from({ length: Roots.Count }, (_, index) => {
		const root = limb(Roots.Length * (0.6 + random() * 0.6), Roots.Radius, material);
		root.rotation.set(Math.PI - Roots.Splay * (0.4 + random() * 0.6), (index / Roots.Count) * Math.PI * 2, 0, 'YXZ');
		return root;
	});
}

export function snagAt(point: WorldPoint, random: () => number) {
	const material = new MeshStandardMaterial({ color: SnagColour, map: barkTexture(), roughness: 1 });
	const trunk = new Group().add(new Mesh(new CylinderGeometry(Trunk.Tip, Trunk.Butt, Trunk.Length, Trunk.Sides).translate(0, Trunk.Length / 2, 0), material));
	trunk.add(...branchesAlong(material, random), ...rootPlate(material, random));
	trunk.rotation.set(Math.PI / 2 - Trunk.LeastTilt - random() * Trunk.TiltRange, random() * Math.PI * 2, 0, 'YXZ');
	const snag = new Group().add(trunk);
	snag.position.set(point.x, -Trunk.Sink, point.z);
	snag.traverse((part) => (part.castShadow = true));
	return snag;
}
