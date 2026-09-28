import { seededRandom } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import { renderQuality } from '../renderQuality';
import type { HedgeLine } from '../terrain/fieldPattern';
import type { Country } from '../terrain/lakeLand';
import { isOutInTheCountry } from './hedgerows';
import { treeAt, type PlantedTree, type TreeKind } from './plantedTree';

const Hedgerow = { LeastGap: 30, GapRange: 70, PoplarShare: 0.22 } as const;
const Copses = { Count: 12, LeastTrees: 6, TreeRange: 10, Radius: 32, ReachShare: 0.9 } as const;
const CountrySeed = 409;

function kindOf(random: () => number): TreeKind {
	return random() < Hedgerow.PoplarShare ? 'poplar' : 'broadleaf';
}

function treesAlong(line: HedgeLine, random: () => number) {
	const { from, to } = line;
	const length = Math.hypot(to.x - from.x, to.z - from.z);
	const trees: PlantedTree[] = [];
	for (let metres = random() * Hedgerow.GapRange; metres < length; metres += Hedgerow.LeastGap + random() * Hedgerow.GapRange) {
		const share = metres / length;
		trees.push(treeAt(kindOf(random), { x: from.x + (to.x - from.x) * share, z: from.z + (to.z - from.z) * share }, random));
	}
	return trees;
}

function copseAround(centre: WorldPoint, random: () => number) {
	const count = Copses.LeastTrees + Math.floor(random() * Copses.TreeRange);
	return Array.from({ length: count }, () => {
		const angle = random() * Math.PI * 2;
		const distance = Math.sqrt(random()) * Copses.Radius;
		return treeAt('broadleaf', { x: centre.x + Math.cos(angle) * distance, z: centre.z + Math.sin(angle) * distance }, random);
	});
}

function copseCentres(country: Country, reach: number, random: () => number) {
	const { shape } = country;
	return Array.from({ length: Copses.Count }, () => {
		const angle = random() * Math.PI * 2;
		const distance = shape.edgeHalf + random() * (reach * Copses.ReachShare - shape.edgeHalf);
		return { x: Math.cos(angle) * distance, z: Math.sin(angle) * distance };
	});
}

export function plantTheCountry(country: Country, seed: number): PlantedTree[] {
	const reach = renderQuality().countryReach;
	const random = seededRandom(seed + CountrySeed);
	const hedgerowTrees = country.fields.hedgesWithin(reach).flatMap((line) => treesAlong(line, random));
	const copseTrees = copseCentres(country, reach, random).flatMap((centre) => copseAround(centre, random));
	return [...hedgerowTrees, ...copseTrees].filter((tree) => isOutInTheCountry(tree.point, country, reach));
}
