import { randomBetween, type RandomFraction } from '$lib/domain/random';
import { metresBetween, type WorldPoint } from '../lakeFrame';
import type { SurveyedBank } from '../grass/coverGround';
import type { CoverPlant } from '../grass/coverScatter';
import { BushCells } from './bushAtlas';

const Keep = { FromWater: 0.4, ShrubFromSwim: 11, BrambleFromSwim: 3.5, FromFacility: 2 } as const;
const Sizes = { Shrub: { height: [1, 2.2], width: [1.4, 2.8] }, Bramble: { height: [0.5, 1], width: [1.2, 2.6] } } as const;
const Lip = { Within: 2.6, TallestBush: 1.2 } as const;
const Look = { BrambleShare: 0.5, FloweringShare: 0.25, DarkShare: 0.45, Lean: 0.08, Darkest: 0.86, Range: 0.2, MostWarmth: 0.1, Reach: 10 } as const;

interface BushSizes {
	height: readonly [number, number];
	width: readonly [number, number];
}

function cellFor(isBramble: boolean, random: RandomFraction) {
	if (isBramble) return random() < Look.FloweringShare ? BushCells.FloweringBramble : BushCells.Bramble;
	return random() < Look.DarkShare ? BushCells.DarkShrub : BushCells.Shrub;
}

function isBrambleCell(cell: number) {
	return cell === BushCells.Bramble || cell === BushCells.FloweringBramble;
}

export function bushKindAt(point: WorldPoint, fromWater: number, random: RandomFraction): CoverPlant {
	const cell = cellFor(random() < Look.BrambleShare, random);
	const sizes: BushSizes = isBrambleCell(cell) ? Sizes.Bramble : Sizes.Shrub;
	const tallest = fromWater < Lip.Within ? Lip.TallestBush : Infinity;
	const height = Math.min(tallest, randomBetween(random, ...sizes.height));
	const tint = { shade: Look.Darkest + random() * Look.Range, warmth: random() * Look.MostWarmth };
	const shape = { height, width: randomBetween(random, ...sizes.width), lean: (random() - 1 / 2) * Look.Lean };
	return { point, cell, ...shape, turn: random() * Math.PI * 2, tint, reach: Look.Reach, isMarginal: false };
}

export function isClearForBush(bush: CoverPlant, fromWater: number, fromSwim: number, bank: SurveyedBank) {
	const { point } = bush;
	const swimGap = isBrambleCell(bush.cell) ? Keep.BrambleFromSwim : Keep.ShrubFromSwim;
	const isClearOfFacilities = bank.facilities.every((spot) => metresBetween(spot.point, point) > spot.radius + Keep.FromFacility);
	return fromWater > Keep.FromWater && fromSwim > swimGap && isClearOfFacilities;
}
