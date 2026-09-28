import { randomBetween, type RandomFraction } from '$lib/domain/random';
import type { WorldPoint } from '../lakeFrame';
import type { SurveyedBank } from '../grass/coverGround';
import type { CoverPlant } from '../grass/coverScatter';
import { metresFromAnySwim } from '../grass/swimClearings';
import type { PlantedTree } from '../trees/treePlanting';
import { bushKindAt, isClearForBush } from './bushKinds';
import { watersideSpots } from './watersideBushes';

const Edge = { WoodsWithin: 40, Share: 0.6, MostPerTree: 3, Outward: [1.5, 7], Sideways: 4 } as const;
const Scatter = { PerSquareMetre: 0.0035, Band: [3, 40], Group: 4, GroupSpread: 3.2 } as const;
const Centred = 1 / 2;

function centredRandom(random: RandomFraction) {
	return random() - Centred;
}

function edgeBushes(tree: PlantedTree, bank: SurveyedBank, random: RandomFraction) {
	const heading = bank.shore.headingTowardTheWater(tree.point);
	const count = Math.ceil(random() * Edge.MostPerTree);
	return Array.from({ length: count }, () => {
		const outward = randomBetween(random, ...Edge.Outward);
		const sideways = centredRandom(random) * Edge.Sideways * 2;
		const { point } = tree;
		return { x: point.x + Math.cos(heading) * outward - Math.sin(heading) * sideways, z: point.z + Math.sin(heading) * outward + Math.cos(heading) * sideways };
	});
}

function isInTheBand(point: WorldPoint, bank: SurveyedBank) {
	const fromWater = bank.shore.distanceAt(point);
	return fromWater > Scatter.Band[0] && fromWater < Scatter.Band[1];
}

function scatteredGroups(bank: SurveyedBank, density: number, random: RandomFraction) {
	const { least, most } = bank.area;
	const groups = Math.round((most.x - least.x) * (most.z - least.z) * Scatter.PerSquareMetre * density);
	const centres = Array.from({ length: groups }, () => ({ x: least.x + random() * (most.x - least.x), z: least.z + random() * (most.z - least.z) }));
	const jitter = () => centredRandom(random) * Scatter.GroupSpread * 2;
	const scattered = (centre: WorldPoint) => ({ x: centre.x + jitter(), z: centre.z + jitter() });
	return centres.filter((centre) => isInTheBand(centre, bank)).flatMap((centre) => Array.from({ length: Math.ceil(random() * Scatter.Group) }, () => scattered(centre)));
}

export function plantBushes(trees: PlantedTree[], bank: SurveyedBank, density: number, random: RandomFraction): CoverPlant[] {
	const edgeTrees = trees.filter((tree) => bank.shore.distanceAt(tree.point) < Edge.WoodsWithin && random() < Edge.Share * density);
	const woodsEdge = edgeTrees.flatMap((tree) => edgeBushes(tree, bank, random));
	const points = [...woodsEdge, ...scatteredGroups(bank, density, random), ...watersideSpots(bank, density, random)];
	return points.flatMap((point) => {
		const fromWater = bank.shore.distanceAt(point);
		const bush = bushKindAt(point, fromWater, random);
		return isClearForBush(bush, fromWater, metresFromAnySwim(point, bank.swims), bank) ? [bush] : [];
	});
}
