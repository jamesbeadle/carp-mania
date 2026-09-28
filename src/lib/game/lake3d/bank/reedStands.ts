import { randomBetween, type RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { CoverNoise } from '../grass/coverNoise';
import type { CoverPlant } from '../grass/coverScatter';
import type { ShoreField } from '../grass/shoreField';
import { ReedCells } from './reedAtlas';
import { reedClumpsAlong, type ReedClump } from './reedClumps';
import { loneReeds } from './loneReeds';

interface StandContext {
	shore: ShoreField;
	random: RandomFraction;
}

const Stand = { PerSquareMetre: 3.4, MostInland: 0.9, MaceShore: -0.9, MaceClumpShare: 0.35, SparseFrom: 0.75, EdgeDrop: 0.3, Swing: 0.2 } as const;
const Heights = { Phragmites: [1.9, 2.7], Reedmace: [1.4, 1.9], Sparse: [1.5, 2.2], Emergent: [1.15, 1.35] } as const;
const Look = { WidthPerHeight: 0.58, NarrowEmergent: 0.4, Darkest: 0.72, Range: 0.22, Reach: 8 } as const;
const Mix = { LeafyShare: 0.4, EmergentShare: 0.14 } as const;

function isMaceClump(clump: ReedClump, context: StandContext) {
	return context.shore.distanceAt(clump.centre) < Stand.MaceShore && context.random() < Stand.MaceClumpShare;
}

function cellFor(reach: number, isMace: boolean, random: RandomFraction) {
	if (random() < Mix.EmergentShare) return isMace ? ReedCells.MaceStems : ReedCells.Emergent;
	if (isMace) return ReedCells.Reedmace;
	if (reach > Stand.SparseFrom) return ReedCells.Sparse;
	return random() < Mix.LeafyShare ? ReedCells.Leafy : ReedCells.Plumed;
}

function baseHeightFor(cell: number, random: RandomFraction) {
	if (cell === ReedCells.Reedmace || cell === ReedCells.MaceStems) return randomBetween(random, ...Heights.Reedmace);
	if (cell === ReedCells.Sparse) return randomBetween(random, ...Heights.Sparse);
	return randomBetween(random, ...Heights.Phragmites);
}

function standIn(clump: ReedClump, isMace: boolean, context: StandContext): CoverPlant | null {
	const { random } = context;
	const turn = random() * Math.PI * 2;
	const reach = Math.sqrt(random());
	const point = { x: clump.centre.x + Math.cos(turn) * reach * clump.radius, z: clump.centre.z + Math.sin(turn) * reach * clump.radius };
	if (context.shore.distanceAt(point) > Stand.MostInland) return null;
	const cell = cellFor(reach, isMace, random);
	const isEmergent = cell === ReedCells.Emergent || cell === ReedCells.MaceStems;
	const rise = isEmergent ? randomBetween(random, ...Heights.Emergent) : 1 - Stand.EdgeDrop * reach * reach;
	const height = baseHeightFor(cell, random) * clump.height * rise * (1 + (random() - 1 / 2) * Stand.Swing);
	const width = height * (isEmergent ? Look.NarrowEmergent : Look.WidthPerHeight);
	const tint = { shade: Look.Darkest + clump.fullness * Look.Range * random(), warmth: clump.straw };
	return { point, cell, height, width, lean: (random() - 1 / 2) * clump.lean * 2, turn: random() * Math.PI, tint, reach: Look.Reach, isMarginal: true };
}

function standsIn(clump: ReedClump, context: StandContext) {
	const isMace = isMaceClump(clump, context);
	const count = Math.max(1, Math.round(Math.PI * clump.radius * clump.radius * Stand.PerSquareMetre));
	return Array.from({ length: count }, () => standIn(clump, isMace, context)).filter((stand): stand is CoverPlant => stand !== null);
}

export function reedStands(lines: WorldPoint[][], shore: ShoreField, seed: number, random: RandomFraction) {
	const clumpContext = { noise: new CoverNoise(seed), random };
	const context = { shore, random };
	const clumps = lines.flatMap((line) => reedClumpsAlong(line, clumpContext));
	return [...clumps.flatMap((clump) => standsIn(clump, context)), ...lines.flatMap((line) => loneReeds(line, shore, random))];
}
