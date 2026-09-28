import { Color, DoubleSide, InstancedMesh, Matrix4, MeshStandardMaterial, PlaneGeometry, Quaternion, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { seededRandom } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { ClearSpot } from '../bank/facilityGrounds';
import { metresBetween, type WorldPoint } from '../lakeFrame';
import type { WindSway } from '../trees/windSway';
import { distanceToOutline, isInsideOutline } from '../worldGeometry';
import { grassBladeTexture } from './bladeTexture';
import { NearDetailLayer, renderQuality } from '../renderQuality';

export interface GrassGround {
	outline: WorldPoint[];
	openings: WorldPoint[];
	keepClear: ClearSpot[];
	plotEdge: WorldPoint | null;
	groundAt: (point: WorldPoint) => number;
	season: SeasonName;
	seed: number;
}

const Tufts = { AttemptsPerTuft: 2.4, NearestWater: 1.4, FarthestWater: 55, LeastHeight: 0.35, HeightRange: 0.45, Width: 0.9, CutOff: 0.4, ClearMargin: 1 } as const;
const SwimSide = { PerSwim: 240, Nearest: 1.8, Farthest: 8 } as const;
const TuftTint: Record<SeasonName, string> = { spring: '#6f9a3a', summer: '#6a8a38', autumn: '#8a8a48', winter: '#7d8062' };
const UpAxis = new Vector3(0, 1, 0);

function crossedCards() {
	const cards = [0, Math.PI / 3, (Math.PI * 2) / 3].map((turn) => new PlaneGeometry(Tufts.Width, 1).translate(0, 0.5, 0).rotateY(turn));
	return mergeGeometries(cards);
}

function isGrassy(point: WorldPoint, ground: GrassGround) {
	const edge = ground.plotEdge;
	const isOffThePlot = edge !== null && (Math.abs(point.x) > edge.x - Tufts.ClearMargin || Math.abs(point.z) > edge.z - Tufts.ClearMargin);
	if (isOffThePlot || isInsideOutline(point, ground.outline)) return false;
	const fromWater = distanceToOutline(point, ground.outline);
	const isNearTheBank = fromWater > Tufts.NearestWater && fromWater < Tufts.FarthestWater;
	return isNearTheBank && ground.keepClear.every((spot) => metresBetween(spot.point, point) > spot.radius + Tufts.ClearMargin);
}

function aroundTheSwim(opening: WorldPoint, random: () => number) {
	const angle = random() * Math.PI * 2;
	const distance = SwimSide.Nearest + Math.sqrt(random()) * (SwimSide.Farthest - SwimSide.Nearest);
	return { x: opening.x + Math.cos(angle) * distance, z: opening.z + Math.sin(angle) * distance };
}

function tuftPoints(ground: GrassGround, count: number, random: () => number) {
	const xs = ground.outline.map((point) => point.x);
	const zs = ground.outline.map((point) => point.z);
	const least = { x: Math.min(...xs) - Tufts.FarthestWater, z: Math.min(...zs) - Tufts.FarthestWater };
	const span = { x: Math.max(...xs) + Tufts.FarthestWater - least.x, z: Math.max(...zs) + Tufts.FarthestWater - least.z };
	const swimSide = ground.openings.flatMap((opening) => Array.from({ length: SwimSide.PerSwim }, () => aroundTheSwim(opening, random)));
	const band = Array.from({ length: Math.round(count * Tufts.AttemptsPerTuft) }, () => ({ x: least.x + random() * span.x, z: least.z + random() * span.z }));
	return [...swimSide.filter((point) => isGrassy(point, ground)), ...band.filter((point) => isGrassy(point, ground)).slice(0, count)];
}

export function createGrassTufts(ground: GrassGround, wind: WindSway) {
	const random = seededRandom(ground.seed);
	const material = wind.sway(new MeshStandardMaterial({ map: grassBladeTexture(), alphaTest: Tufts.CutOff, side: DoubleSide, roughness: 1 }));
	const points = tuftPoints(ground, renderQuality().grassTufts, random);
	const mesh = new InstancedMesh(crossedCards(), material, Math.max(1, points.length));
	mesh.layers.set(NearDetailLayer);
	const tint = new Color(TuftTint[ground.season]);
	points.forEach((point, index) => {
		const height = Tufts.LeastHeight + random() * Tufts.HeightRange;
		const turn = new Quaternion().setFromAxisAngle(UpAxis, random() * Math.PI);
		mesh.setMatrixAt(index, new Matrix4().compose(new Vector3(point.x, ground.groundAt(point), point.z), turn, new Vector3(height, height, height)));
		mesh.setColorAt(index, tint.clone().offsetHSL(0, 0, (random() - 0.5) * 0.08));
	});
	mesh.count = points.length;
	return mesh;
}
