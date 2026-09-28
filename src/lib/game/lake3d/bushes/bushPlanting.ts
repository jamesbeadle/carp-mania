import { Color } from 'three';
import { randomBetween, type RandomFraction } from '$lib/domain/random';
import { metresBetween, type WorldPoint } from '../lakeFrame';
import type { SurveyedBank } from '../grass/coverGround';
import type { CoverPlant } from '../grass/coverScatter';
import { metresFromAnySwim } from '../grass/swimClearings';
import type { PlantedTree } from '../trees/treePlanting';
import { BushCells } from './bushAtlas';
import { watersideSpots } from './watersideBushes';

const Edge = { WoodsWithin: 45, Share: 1, MostPerTree: 4, Outward: [1.5, 7], Sideways: 4 } as const;
const Scatter = { PerSquareMetre: 0.005, Band: [3, 40], Group: 5, GroupSpread: 3.2 } as const;
const Keep = { FromWater: 0.4, FromSwim: 4, FromFacility: 2 } as const;
const Sizes = { Shrub: { height: [1.1, 2.6], width: [1.1, 2.4] }, Bramble: { height: [0.6, 1.2], width: [1.3, 2.8] } } as const;
interface BushSizes {
	height: readonly [number, number];
	width: readonly [number, number];
}

const Look = { BrambleShare: 0.45, Lean: 0.08, Darkest: 0.78, Range: 0.3, Reach: 10 } as const;

function canGrowAt(point: WorldPoint, bank: SurveyedBank) {
	const isAwayFromWater = bank.shore.distanceAt(point) > Keep.FromWater;
	const isAwayFromSwims = metresFromAnySwim(point, bank.swims) > Keep.FromSwim;
	return isAwayFromWater && isAwayFromSwims && bank.facilities.every((spot) => metresBetween(spot.point, point) > spot.radius + Keep.FromFacility);
}

function bushAt(point: WorldPoint, random: RandomFraction): CoverPlant {
	const isBramble = random() < Look.BrambleShare;
	const sizes: BushSizes = isBramble ? Sizes.Bramble : Sizes.Shrub;
	const tint = new Color().setScalar(Look.Darkest + random() * Look.Range);
	return { point, cell: isBramble ? BushCells.Bramble : BushCells.Shrub, height: randomBetween(random, ...sizes.height), width: randomBetween(random, ...sizes.width), lean: (random() - 0.5) * Look.Lean, turn: random() * Math.PI * 2, tint, reach: Look.Reach, isMarginal: false };
}

function edgeBushes(tree: PlantedTree, bank: SurveyedBank, random: RandomFraction) {
	const heading = bank.shore.headingTowardTheWater(tree.point);
	const count = Math.ceil(random() * Edge.MostPerTree);
	return Array.from({ length: count }, () => {
		const outward = randomBetween(random, ...Edge.Outward);
		const sideways = (random() - 0.5) * Edge.Sideways * 2;
		const { point } = tree;
		return { x: point.x + Math.cos(heading) * outward - Math.sin(heading) * sideways, z: point.z + Math.sin(heading) * outward + Math.cos(heading) * sideways };
	});
}

function scatteredGroups(bank: SurveyedBank, density: number, random: RandomFraction) {
	const { least, most } = bank.area;
	const groups = Math.round((most.x - least.x) * (most.z - least.z) * Scatter.PerSquareMetre * density);
	const centres = Array.from({ length: groups }, () => ({ x: least.x + random() * (most.x - least.x), z: least.z + random() * (most.z - least.z) }));
	const inTheBand = centres.filter((centre) => bank.shore.distanceAt(centre) > Scatter.Band[0] && bank.shore.distanceAt(centre) < Scatter.Band[1]);
	return inTheBand.flatMap((centre) => Array.from({ length: Math.ceil(random() * Scatter.Group) }, () => ({ x: centre.x + (random() - 0.5) * Scatter.GroupSpread * 2, z: centre.z + (random() - 0.5) * Scatter.GroupSpread * 2 })));
}

export function plantBushes(trees: PlantedTree[], bank: SurveyedBank, density: number, random: RandomFraction) {
	const edgeTrees = trees.filter((tree) => bank.shore.distanceAt(tree.point) < Edge.WoodsWithin && random() < Edge.Share * density);
	const points = [...edgeTrees.flatMap((tree) => edgeBushes(tree, bank, random)), ...scatteredGroups(bank, density, random), ...watersideSpots(bank, density, random)];
	return points.filter((point) => canGrowAt(point, bank)).map((point) => bushAt(point, random));
}
