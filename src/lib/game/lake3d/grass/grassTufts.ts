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
	keepClear: ClearSpot[];
	plotEdge: WorldPoint | null;
	groundAt: (point: WorldPoint) => number;
	season: SeasonName;
	seed: number;
}

const Tufts = { AttemptsPerTuft: 2.4, NearestWater: 1.4, FarthestWater: 55, LeastHeight: 0.35, HeightRange: 0.45, Width: 0.9, CutOff: 0.4, ClearMargin: 1 } as const;
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

export function createGrassTufts(ground: GrassGround, wind: WindSway) {
	const random = seededRandom(ground.seed);
	const xs = ground.outline.map((point) => point.x);
	const zs = ground.outline.map((point) => point.z);
	const reach = Tufts.FarthestWater;
	const material = wind.sway(new MeshStandardMaterial({ map: grassBladeTexture(), alphaTest: Tufts.CutOff, side: DoubleSide, roughness: 1 }));
	const count = renderQuality().grassTufts;
	const mesh = new InstancedMesh(crossedCards(), material, count);
	mesh.layers.set(NearDetailLayer);
	const tint = new Color(TuftTint[ground.season]);
	let placed = 0;
	for (let attempt = 0; attempt < count * Tufts.AttemptsPerTuft && placed < count; attempt++) {
		const point = { x: Math.min(...xs) - reach + random() * (Math.max(...xs) - Math.min(...xs) + reach * 2), z: Math.min(...zs) - reach + random() * (Math.max(...zs) - Math.min(...zs) + reach * 2) };
		if (!isGrassy(point, ground)) continue;
		const height = Tufts.LeastHeight + random() * Tufts.HeightRange;
		const turn = new Quaternion().setFromAxisAngle(UpAxis, random() * Math.PI);
		mesh.setMatrixAt(placed, new Matrix4().compose(new Vector3(point.x, ground.groundAt(point), point.z), turn, new Vector3(height, height, height)));
		mesh.setColorAt(placed, tint.clone().offsetHSL(0, 0, (random() - 0.5) * 0.08));
		placed += 1;
	}
	mesh.count = placed;
	return mesh;
}
