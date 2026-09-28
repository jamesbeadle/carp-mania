import { Mesh, MeshStandardMaterial, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import type { SurveyedBank } from '../grass/coverGround';
import { barkTexture } from './barkTexture';
import { shadedWood, WoodTones } from './barkShading';
import { branchesOf } from './fallenLimbs';
import { rootsOf, soilClod } from './fallenRoots';
import { trunkPoints, trunkTubes } from './fallenTrunk';

const Tree = { Length: 9, CrownSink: 1.1, RootShare: 0.3 } as const;
const Finish = { Roughness: 0.92 } as const;

function toneAll(parts: BufferGeometry[], tone: (typeof WoodTones)[keyof typeof WoodTones], random: RandomFraction) {
	return parts.map((part) => shadedWood(part.index ? part.toNonIndexed() : part, tone, random));
}

function rootPointOf(point: WorldPoint, heading: number): WorldPoint {
	const back = Tree.Length * Tree.RootShare;
	return { x: point.x - Math.cos(heading) * back, z: point.z - Math.sin(heading) * back };
}

export function createFallenTree(point: WorldPoint, bank: SurveyedBank, random: RandomFraction) {
	const heading = bank.shore.headingTowardTheWater(point);
	const root = rootPointOf(point, heading);
	const rootHeight = Math.max(0, bank.groundAt(root));
	const trunk = trunkPoints({ length: Tree.Length, rootHeight, crownSink: Tree.CrownSink }, random);
	const [base] = trunk;
	const bark = toneAll([...trunkTubes(trunk, random), ...branchesOf(trunk, random)], WoodTones.Bark, random);
	const roots = toneAll(rootsOf(base, random), WoodTones.Root, random);
	const clod = toneAll([soilClod(base, bank.seed)], WoodTones.Soil, random);
	const material = new MeshStandardMaterial({ map: barkTexture(), vertexColors: true, roughness: Finish.Roughness });
	const mesh = new Mesh(mergeGeometries([...bark, ...roots, ...clod]), material);
	mesh.position.set(root.x, 0, root.z);
	mesh.rotation.set(0, -heading, 0);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	mesh.name = 'fallen-tree';
	return mesh;
}
