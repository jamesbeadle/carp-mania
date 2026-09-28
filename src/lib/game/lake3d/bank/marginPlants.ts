import { Color, DodecahedronGeometry, DoubleSide, Group, InstancedMesh, Matrix4, MeshStandardMaterial, PlaneGeometry, Quaternion, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { seededRandom } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { rushTexture } from '../grass/rushTexture';
import { metresBetween, type WorldPoint } from '../lakeFrame';
import type { WindSway } from '../trees/windSway';

export interface MarginGround {
	shores: WorldPoint[][];
	reedLines: WorldPoint[][];
	openings: WorldPoint[];
	season: SeasonName;
	seed: number;
	groundAt: (point: WorldPoint) => number;
}

const Margin = { StepMetres: 0.5, Jitter: 0.8, OpeningMetres: 6, Seed: 331 } as const;
const Stretches = { Long: 17, Short: 7.3, ShortWeight: 0.5, RushyAbove: 0.2 } as const;
const Rush = { Width: 0.8, CutOff: 0.35, Keep: 0.8 } as const;
const Heights = { Rushes: { least: 0.8, range: 1 }, Reeds: { least: 1.4, range: 1 } } as const;
const ReedBed = { SpacingMetres: 0.3, Spread: 1.8 } as const;
const Stone = { Chance: 0.2, LeastSize: 0.06, SizeRange: 0.24, Flatten: 0.55, Sink: 0.3 } as const;
const RushTint: Record<SeasonName, string> = { spring: '#5f8a34', summer: '#4f7a2c', autumn: '#8a8440', winter: '#7c7456' };
const StoneTones = ['#8a8479', '#6f6a60', '#9a9384', '#5d5850'];
const UpAxis = new Vector3(0, 1, 0);

function isRushyStretch(travelled: number) {
	return Math.sin(travelled / Stretches.Long) + Math.sin(travelled / Stretches.Short) * Stretches.ShortWeight > Stretches.RushyAbove;
}

function spotsAlong(shore: WorldPoint[], random: () => number) {
	const spots: { point: WorldPoint; isRushy: boolean }[] = [];
	let travelled = 0;
	shore.forEach((start, index) => {
		const end = shore[(index + 1) % shore.length];
		const length = metresBetween(start, end);
		for (let along = 0; along < length; along += Margin.StepMetres) {
			const share = along / length;
			const point = { x: start.x + (end.x - start.x) * share + (random() - 0.5) * Margin.Jitter, z: start.z + (end.z - start.z) * share + (random() - 0.5) * Margin.Jitter };
			spots.push({ point, isRushy: isRushyStretch(travelled + along) });
		}
		travelled += length;
	});
	return spots;
}

function placement(point: WorldPoint, height: number, size: Vector3, random: () => number) {
	const turn = new Quaternion().setFromAxisAngle(UpAxis, random() * Math.PI * 2);
	return new Matrix4().compose(new Vector3(point.x, height, point.z), turn, size);
}

function reedBedAlong(line: WorldPoint[], random: () => number) {
	return line.slice(1).flatMap((point, index) => {
		const previous = line[index];
		const count = Math.ceil(metresBetween(previous, point) / ReedBed.SpacingMetres);
		return Array.from({ length: count }, (_, step) => ({ x: previous.x + ((point.x - previous.x) * step) / count + (random() - 0.5) * ReedBed.Spread, z: previous.z + ((point.z - previous.z) * step) / count + (random() - 0.5) * ReedBed.Spread }));
	});
}

function rushClumps(points: WorldPoint[], heights: { least: number; range: number }, ground: MarginGround, wind: WindSway, random: () => number) {
	const cards = mergeGeometries([0, Math.PI / 2].map((turn) => new PlaneGeometry(Rush.Width, 1).translate(0, 0.5, 0).rotateY(turn)));
	const material = wind.sway(new MeshStandardMaterial({ map: rushTexture(), alphaTest: Rush.CutOff, side: DoubleSide, roughness: 0.9 }));
	const mesh = new InstancedMesh(cards, material, Math.max(1, points.length));
	const tint = new Color(RushTint[ground.season]);
	points.forEach((point, index) => {
		const height = heights.least + random() * heights.range;
		mesh.setMatrixAt(index, placement(point, ground.groundAt(point), new Vector3(height, height, height), random));
		mesh.setColorAt(index, tint.clone().offsetHSL(0, 0, (random() - 0.5) * 0.1));
	});
	mesh.count = points.length;
	return mesh;
}

function stones(points: WorldPoint[], ground: MarginGround, random: () => number) {
	const mesh = new InstancedMesh(new DodecahedronGeometry(1, 0), new MeshStandardMaterial({ roughness: 0.95 }), Math.max(1, points.length));
	points.forEach((point, index) => {
		const size = Stone.LeastSize + random() * Stone.SizeRange;
		mesh.setMatrixAt(index, placement(point, ground.groundAt(point) - size * Stone.Sink, new Vector3(size, size * Stone.Flatten, size * (0.7 + random() * 0.6)), random));
		mesh.setColorAt(index, new Color(StoneTones[index % StoneTones.length]));
	});
	mesh.count = points.length;
	mesh.receiveShadow = true;
	return mesh;
}

export function createMarginPlants(ground: MarginGround, wind: WindSway) {
	const random = seededRandom(ground.seed + Margin.Seed);
	const isOpen = (point: WorldPoint) => ground.openings.every((opening) => metresBetween(opening, point) > Margin.OpeningMetres);
	const spots = ground.shores.flatMap((shore) => spotsAlong(shore, random)).filter((spot) => isOpen(spot.point));
	const rushy = spots.filter((spot) => spot.isRushy && random() < Rush.Keep).map((spot) => spot.point);
	const stony = spots.filter((spot) => !spot.isRushy && random() < Stone.Chance).map((spot) => spot.point);
	const reeds = ground.reedLines.flatMap((line) => reedBedAlong(line, random));
	return new Group().add(rushClumps(rushy, Heights.Rushes, ground, wind, random), rushClumps(reeds, Heights.Reeds, ground, wind, random), stones(stony, ground, random));
}
