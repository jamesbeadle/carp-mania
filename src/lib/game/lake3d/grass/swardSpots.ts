import { InstancedBufferAttribute } from 'three';
import { randomBetween, seededRandom, type RandomFraction } from '$lib/domain/random';
import { CoverCells } from './coverAtlas';

interface SwardKind {
	cell: number;
	share: number;
	heights: [number, number];
	widthPerHeight: [number, number];
}

const Kinds: SwardKind[] = [
	{ cell: CoverCells.Sward, share: 0.58, heights: [0.05, 0.15], widthPerHeight: [2.4, 3.6] },
	{ cell: CoverCells.CloverSward, share: 0.12, heights: [0.05, 0.1], widthPerHeight: [2.2, 3] },
	{ cell: CoverCells.ShortGrass, share: 0.2, heights: [0.1, 0.22], widthPerHeight: [1.4, 2] },
	{ cell: CoverCells.TuftedGrass, share: 0.1, heights: [0.12, 0.26], widthPerHeight: [1.1, 1.6] }
];
const Shade = { Darkest: 0.8, Range: 0.28 } as const;
const Size = 4;
const SpotSeed = 7717;

function kindFor(random: RandomFraction) {
	let pick = random();
	return Kinds.find((kind) => (pick -= kind.share) <= 0) ?? Kinds[0];
}

function lookOf(random: RandomFraction) {
	const kind = kindFor(random);
	const height = randomBetween(random, ...kind.heights);
	return [kind.cell, height, height * randomBetween(random, ...kind.widthPerHeight), Shade.Darkest + random() * Shade.Range];
}

export function swardSpots(span: number, perSquareMetre: number) {
	const cellsAcross = Math.ceil(span * Math.sqrt(perSquareMetre));
	const cellMetres = span / cellsAcross;
	const count = cellsAcross * cellsAcross;
	const spots = new Float32Array(count * Size);
	const looks = new Float32Array(count * Size);
	const random = seededRandom(SpotSeed);
	for (let index = 0; index < count; index++) {
		const column = index % cellsAcross;
		const row = Math.floor(index / cellsAcross);
		spots.set([(column + random()) * cellMetres, (row + random()) * cellMetres, random(), random()], index * Size);
		looks.set(lookOf(random), index * Size);
	}
	return { count, spot: new InstancedBufferAttribute(spots, Size), look: new InstancedBufferAttribute(looks, Size) };
}
