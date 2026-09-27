import { CircleGeometry, ConeGeometry, CylinderGeometry, DoubleSide, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { seededRandom } from '$lib/domain/random';
import { isAreaFeature, isReedLine, isSnag, type LakeLayout } from '$lib/domain/layout/layoutTypes';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { worldPointOf, type LakeFrame, type WorldPoint } from '../lakeFrame';
import { isInsideOutline } from '../worldGeometry';
import { smoothWorldOutline } from '../worldShapes';

const Reeds = { SpacingMetres: 0.7, Spread: 1.6, Height: 1.8, Blades: 5 } as const;
const Lilies = { PerSquareMetre: 0.5, Most: 900, Radius: 0.28, Lift: 0.025 } as const;
const ReedColour: Record<SeasonName, string> = { spring: '#6a8a3a', summer: '#5a7a2e', autumn: '#a08a4a', winter: '#8a7a5a' };
const LilyColour = '#3f6f2c';
const SnagColour = '#3a2c20';
const Snag = { BranchOut: 0.4, BranchUp: 0.9, BranchLean: -0.5 } as const;
const UpAxis = new Vector3(0, 1, 0);

function reedClump() {
	return mergeGeometries(Array.from({ length: Reeds.Blades }, (_, index) => {
		const blade = new ConeGeometry(0.03, 1, 3);
		blade.translate((index % 3) * 0.08 - 0.08, 0.5, Math.floor(index / 3) * 0.08);
		return blade;
	}));
}

function scatterAlong(line: WorldPoint[], random: () => number) {
	return line.slice(1).flatMap((point, index) => {
		const previous = line[index];
		const count = Math.ceil(Math.hypot(point.x - previous.x, point.z - previous.z) / Reeds.SpacingMetres);
		return Array.from({ length: count }, (_, step) => ({ x: previous.x + ((point.x - previous.x) * step) / count + (random() - 0.5) * Reeds.Spread, z: previous.z + ((point.z - previous.z) * step) / count + (random() - 0.5) * Reeds.Spread }));
	});
}

function scatterWithin(area: WorldPoint[], random: () => number) {
	const xs = area.map((point) => point.x);
	const zs = area.map((point) => point.z);
	const least = { x: Math.min(...xs), z: Math.min(...zs) };
	const size = { x: Math.max(...xs) - least.x, z: Math.max(...zs) - least.z };
	const count = Math.min(Lilies.Most, Math.round(size.x * size.z * Lilies.PerSquareMetre));
	return Array.from({ length: count }, () => ({ x: least.x + random() * size.x, z: least.z + random() * size.z })).filter((point) => isInsideOutline(point, area));
}

function instanced(geometry: ConstructorParameters<typeof InstancedMesh>[0], material: MeshStandardMaterial, points: WorldPoint[], height: number, random: () => number, lift = 0) {
	const mesh = new InstancedMesh(geometry, material, Math.max(1, points.length));
	mesh.count = points.length;
	points.forEach((point, index) => {
		const size = height * (0.7 + random() * 0.6);
		const turn = new Quaternion().setFromAxisAngle(UpAxis, random() * Math.PI * 2);
		mesh.setMatrixAt(index, new Matrix4().compose(new Vector3(point.x, lift, point.z), turn, new Vector3(size, size, size)));
	});
	return mesh;
}

function snagAt(point: WorldPoint, random: () => number) {
	const material = new MeshStandardMaterial({ color: SnagColour, roughness: 1 });
	const trunk = new Mesh(new CylinderGeometry(0.12, 0.2, 5, 6), material);
	trunk.rotation.set(0.9 + random() * 0.4, random() * Math.PI * 2, 0, 'YXZ');
	const branch = new Mesh(new CylinderGeometry(0.04, 0.07, 1.8, 5), material);
	branch.position.set(Snag.BranchOut, Snag.BranchUp, 0);
	branch.rotation.set(0, 0, Snag.BranchLean);
	const group = new Group().add(trunk, branch);
	group.position.set(point.x, 0, point.z);
	return group;
}

export function createLakeFeatures(layout: LakeLayout, frame: LakeFrame, season: SeasonName, seed: number) {
	const random = seededRandom(seed);
	const group = new Group();
	const reedPoints = layout.features.filter(isReedLine).flatMap((line) => scatterAlong(line.points.map((point) => worldPointOf(frame, point)), random));
	group.add(instanced(reedClump(), new MeshStandardMaterial({ color: ReedColour[season], roughness: 0.9 }), reedPoints, Reeds.Height, random));
	const lilyPoints = layout.features.filter(isAreaFeature).filter((area) => area.kind === 'lily_pads').flatMap((area) => scatterWithin(smoothWorldOutline(frame, area.points), random));
	group.add(instanced(new CircleGeometry(Lilies.Radius, 9, 0.3, Math.PI * 1.85).rotateX(-Math.PI / 2), new MeshStandardMaterial({ color: LilyColour, roughness: 0.6, side: DoubleSide }), lilyPoints, 1, random, Lilies.Lift));
	layout.features.filter(isSnag).forEach((snag) => group.add(snagAt(worldPointOf(frame, snag.point), random)));
	return group;
}
