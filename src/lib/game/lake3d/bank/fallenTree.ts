import { BufferAttribute, Color, IcosahedronGeometry, Mesh, MeshStandardMaterial, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import type { ShoreField } from '../grass/shoreField';
import { branchesOf, limbBetween, trunkPoints } from './fallenLimbs';

const Tree = { Length: 8.5, RootRise: 0.4, CrownSink: 0.7, TrunkRadius: 0.3, TopRadius: 0.07, Sides: 9 } as const;
const RootPlate = { Radius: 1.1, Thin: 0.3 } as const;
const Bark = { Dry: new Color('#6a5e52'), Wet: new Color('#2e2a22'), Earth: new Color('#3e3024'), WetBelow: 0.08, Roughness: 0.95 } as const;
const Gradient = { Step: 0.5, RootShare: 0.3 } as const;

function coloured(geometry: BufferGeometry, isEarth: boolean) {
	const positions = geometry.getAttribute('position');
	const colours = new Float32Array(positions.count * 3);
	const colour = new Color();
	for (let index = 0; index < positions.count; index++) {
		const isWet = positions.getY(index) < Bark.WetBelow;
		colour.copy(isEarth ? Bark.Earth : Bark.Dry).lerp(Bark.Wet, isWet ? 1 : 0);
		colour.toArray(colours, index * 3);
	}
	geometry.setAttribute('color', new BufferAttribute(colours, 3));
	return geometry;
}

function awayFromTheBank(point: WorldPoint, shore: ShoreField) {
	const across = shore.distanceAt({ x: point.x + Gradient.Step, z: point.z }) - shore.distanceAt({ x: point.x - Gradient.Step, z: point.z });
	const down = shore.distanceAt({ x: point.x, z: point.z + Gradient.Step }) - shore.distanceAt({ x: point.x, z: point.z - Gradient.Step });
	return Math.atan2(-down, -across);
}

export function createFallenTree(point: WorldPoint, shore: ShoreField, random: RandomFraction) {
	const trunk = trunkPoints({ length: Tree.Length, rise: Tree.RootRise, sink: Tree.CrownSink }, random);
	const limbs = trunk.slice(1).map((end, index) => limbBetween(trunk[index], end, Tree.TrunkRadius - ((Tree.TrunkRadius - Tree.TopRadius) * index) / trunk.length, Tree.TrunkRadius - ((Tree.TrunkRadius - Tree.TopRadius) * (index + 1)) / trunk.length, Tree.Sides));
	const plate = new IcosahedronGeometry(RootPlate.Radius, 1).scale(RootPlate.Thin, 1, 1).translate(0, Tree.RootRise, 0).toNonIndexed();
	const bark = mergeGeometries([...limbs, ...branchesOf(trunk, random)].map((limb) => coloured(limb.toNonIndexed(), false)));
	const mesh = new Mesh(mergeGeometries([bark, coloured(plate, true)]), new MeshStandardMaterial({ vertexColors: true, roughness: Bark.Roughness }));
	const heading = awayFromTheBank(point, shore);
	mesh.position.set(point.x - Math.cos(heading) * Tree.Length * Gradient.RootShare, 0, point.z - Math.sin(heading) * Tree.Length * Gradient.RootShare);
	mesh.rotation.set(0, -heading, 0);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
}
