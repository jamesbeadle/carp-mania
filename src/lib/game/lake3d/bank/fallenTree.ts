import { BufferAttribute, Color, IcosahedronGeometry, Mesh, MeshStandardMaterial, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import type { ShoreField } from '../grass/shoreField';
import { barkTexture } from './barkTexture';
import { branchesOf, limbBetween, trunkPoints } from './fallenLimbs';
import { rootsOf } from './fallenRoots';

const Tree = { Length: 9, RootRise: 0.3, CrownSink: 1.2, TrunkRadius: 0.3, TopRadius: 0.07, Sides: 9 } as const;
const RootPlate = { Radius: 0.75, Thin: 0.4 } as const;
const Bark = { Dry: new Color('#5a5046'), Wet: new Color('#262a1c'), Earth: new Color('#3a2c20'), WetBelow: 0.08, Roughness: 0.95, ToneSwing: 0.12 } as const;
const Gradient = { RootShare: 0.3 } as const;

function trunkRadiusAt(share: number) {
	return Tree.TrunkRadius - (Tree.TrunkRadius - Tree.TopRadius) * share;
}

function coloured(geometry: BufferGeometry, base: Color) {
	const positions = geometry.getAttribute('position');
	const colours = new Float32Array(positions.count * 3);
	const colour = new Color();
	for (let index = 0; index < positions.count; index++) {
		const isWet = positions.getY(index) < Bark.WetBelow;
		colour.copy(base).lerp(Bark.Wet, isWet ? 1 : 0);
		colour.toArray(colours, index * 3);
	}
	geometry.setAttribute('color', new BufferAttribute(colours, 3));
	return geometry;
}

export function createFallenTree(point: WorldPoint, shore: ShoreField, random: RandomFraction) {
	const trunk = trunkPoints({ length: Tree.Length, rise: Tree.RootRise, sink: Tree.CrownSink }, random);
	const radiusAtJoint = (joint: number) => trunkRadiusAt(joint / trunk.length);
	const limbs = trunk.slice(1).map((end, index) => limbBetween(trunk[index], end, radiusAtJoint(index), radiusAtJoint(index + 1), Tree.Sides));
	const plate = new IcosahedronGeometry(RootPlate.Radius, 1).scale(RootPlate.Thin, 1, 1).translate(0, Tree.RootRise, 0);
	const wood = [...limbs, ...branchesOf(trunk, random), ...rootsOf(trunk[0], random)];
	const bark = mergeGeometries(wood.map((limb) => coloured(limb.toNonIndexed(), Bark.Dry.clone().offsetHSL(0, 0, (random() - 1 / 2) * Bark.ToneSwing))));
	const wholeTree = mergeGeometries([bark, coloured(plate, Bark.Earth)]);
	const mesh = new Mesh(wholeTree, new MeshStandardMaterial({ map: barkTexture(), vertexColors: true, roughness: Bark.Roughness }));
	const heading = shore.headingTowardTheWater(point);
	mesh.position.set(point.x - Math.cos(heading) * Tree.Length * Gradient.RootShare, 0, point.z - Math.sin(heading) * Tree.Length * Gradient.RootShare);
	mesh.rotation.set(0, -heading, 0);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	return mesh;
}
