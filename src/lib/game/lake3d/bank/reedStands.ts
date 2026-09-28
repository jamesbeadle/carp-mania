import { randomBetween, type RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { CoverNoise } from '../grass/coverNoise';
import type { CoverPlant } from '../grass/coverScatter';
import type { ShoreField } from '../grass/shoreField';
import { ReedCells } from './reedAtlas';

const Stand = { StepMetres: 0.16, BandHalfWidth: 3.2, MostInland: 0.9, Gappiness: 0.45, EdgeShare: 0.7, MaceShore: -1 } as const;
const Heights = { Phragmites: [1.9, 2.9], Reedmace: [1.4, 2.0], Sparse: [1.5, 2.3] } as const;
const Look = { WidthPerHeight: 0.58, Lean: 0.07, Darkest: 0.6, ClumpRange: 0.32, StandRange: 0.16, MostWarmth: 0.14, Reach: 8 } as const;
const Mix = { MaceShare: 0.3, LeafyShare: 0.4, LeastHeight: 0.55, HeightSwing: 0.85, StandSwing: 0.3, EmergentShare: 0.07, Emergent: 1.3 } as const;
const Wavelengths = { Gaps: 7, Height: 6, Tone: 4 } as const;

interface StandContext {
	shore: ShoreField;
	noise: CoverNoise;
	random: RandomFraction;
}

function cellFor(offset: number, shore: number, random: RandomFraction) {
	if (shore < Stand.MaceShore && random() < Mix.MaceShare) return ReedCells.Reedmace;
	if (Math.abs(offset) > Stand.BandHalfWidth * Stand.EdgeShare) return ReedCells.Sparse;
	return random() < Mix.LeafyShare ? ReedCells.Leafy : ReedCells.Plumed;
}

function heightsFor(cell: number): readonly [number, number] {
	if (cell === ReedCells.Reedmace) return Heights.Reedmace;
	return cell === ReedCells.Sparse ? Heights.Sparse : Heights.Phragmites;
}

function heightSwingAt(point: WorldPoint, context: StandContext) {
	const { noise, random } = context;
	const emergent = random() < Mix.EmergentShare ? Mix.Emergent : 1;
	const clump = Mix.LeastHeight + noise.at(point, Wavelengths.Height) * Mix.HeightSwing;
	return clump * emergent * (1 + (random() - 1 / 2) * Mix.StandSwing);
}

function standAt(point: WorldPoint, offset: number, context: StandContext): CoverPlant | null {
	const { shore, noise, random } = context;
	const fromWater = shore.distanceAt(point);
	const isThick = random() < 1 - Stand.Gappiness + noise.at(point, Wavelengths.Gaps) * Stand.Gappiness;
	if (fromWater > Stand.MostInland || !isThick) return null;
	const cell = cellFor(offset, fromWater, random);
	const height = randomBetween(random, ...heightsFor(cell)) * heightSwingAt(point, context);
	const tint = { shade: Look.Darkest + noise.at(point, Wavelengths.Tone) * Look.ClumpRange + random() * Look.StandRange, warmth: random() * Look.MostWarmth };
	const lean = (random() - 1 / 2) * Look.Lean * 2;
	return { point, cell, height, width: height * Look.WidthPerHeight, lean, turn: random() * Math.PI, tint, reach: Look.Reach, isMarginal: true };
}

function standsAlong(start: WorldPoint, end: WorldPoint, context: StandContext) {
	const length = Math.hypot(end.x - start.x, end.z - start.z);
	const across = { x: -(end.z - start.z) / Math.max(length, Number.EPSILON), z: (end.x - start.x) / Math.max(length, Number.EPSILON) };
	const steps = Math.ceil(length / Stand.StepMetres);
	return Array.from({ length: steps }, (_, step) => {
		const along = step / steps;
		const offset = (context.random() * 2 - 1) * Stand.BandHalfWidth;
		const point = { x: start.x + (end.x - start.x) * along + across.x * offset, z: start.z + (end.z - start.z) * along + across.z * offset };
		return standAt(point, offset, context);
	}).filter((stand): stand is CoverPlant => stand !== null);
}

export function reedStands(lines: WorldPoint[][], shore: ShoreField, seed: number, random: RandomFraction) {
	const context = { shore, noise: new CoverNoise(seed), random };
	return lines.flatMap((line) => line.slice(1).flatMap((point, index) => standsAlong(line[index], point, context)));
}
