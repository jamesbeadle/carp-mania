import { guidePriceOf } from '../market/valuation';
import { pickRandom, type RandomFraction } from '../random';
import { FisheryClock } from '../simulation/elapsedDays';
import type { BrandName } from '../tackle/brands';
import type { Carp, Swim } from '../types';
import { BountyKinds, type BountyKind } from './bountyKinds';
import { difficultyBandOf, type DifficultyBand } from './difficultyBand';
import { drawPrize, sponsorFor, type Prize } from './prizeTackle';

export interface NewBounty {
	kind: BountyKind;
	band: DifficultyBand;
	swimId: string | null;
	swimName: string | null;
	targetCarpId: string | null;
	targetCarpName: string | null;
	targetWeightLb: number | null;
	sponsorBrand: BrandName;
	prize: Prize;
	opensAt: Date;
	endsAt: Date;
}

export const BountyDraw = { ChancePerFisheryDay: 0.04, ShortestWindowDays: 2, LongestWindowDays: 6 } as const;
export const OwnersBounty = { LeastMoney: 250, MostMoney: 50000 } as const;
export const NamedFishFromLb = 20;
export const TheLine = { ShareOfBest: 0.85, RoundedToLb: 5, LowestLb: 10 } as const;
const KindWeights: Record<BountyKind, number> = { top_of_the_water: 3, named_fish: 2, peg_prize: 2, over_the_line: 2, hard_graft: 1 };

type Weighed = Pick<Carp, 'id' | 'name' | 'weight_lb' | 'strain' | 'condition' | 'fame' | 'is_catalogued'>;

export function isBountyDrawnToday(random: RandomFraction) {
	return random() < BountyDraw.ChancePerFisheryDay;
}

export function drawBountyFor(carp: Weighed[], swims: Pick<Swim, 'id' | 'name'>[], random: RandomFraction, dayStart: Date): NewBounty | null {
	if (carp.length === 0 || swims.length === 0) return null;
	const kind = drawKind(random, carp);
	const target = targetFor(kind, carp, random);
	const swim = kind === 'peg_prize' ? pickRandom(random, swims) : null;
	const bestLb = bestWeightOf(carp);
	const fishOverLine = carp.filter((fish) => Number(fish.weight_lb) >= (target.weightLb ?? bestLb)).length;
	const band = difficultyBandOf({ kind, targetWeightLb: target.weightLb }, { bestLb, fishOverLine });
	const sponsorBrand = sponsorFor(band, random);
	const prize = drawPrize(band, sponsorBrand, guidePriceOf(bestFishOf(carp)), random);
	const { ShortestWindowDays, LongestWindowDays } = BountyDraw;
	const windowDays = ShortestWindowDays + Math.floor(random() * (LongestWindowDays - ShortestWindowDays + 1));
	const endsAt = new Date(dayStart.getTime() + windowDays * FisheryClock.RealMillisecondsPerFisheryDay);
	return { kind, band, swimId: swim?.id ?? null, swimName: swim?.name ?? null, ...target, sponsorBrand, prize, opensAt: dayStart, endsAt };
}

function drawKind(random: RandomFraction, carp: Weighed[]): BountyKind {
	const hasANamedTarget = carp.some(isWorthNaming);
	const kinds = BountyKinds.filter((kind) => kind !== 'named_fish' || hasANamedTarget);
	const total = kinds.reduce((sum, kind) => sum + KindWeights[kind], 0);
	let roll = random() * total;
	for (const kind of kinds) {
		roll -= KindWeights[kind];
		if (roll < 0) return kind;
	}
	return kinds[kinds.length - 1];
}

function targetFor(kind: BountyKind, carp: Weighed[], random: RandomFraction) {
	const noTarget = { targetCarpId: null, targetCarpName: null, targetWeightLb: null, weightLb: null };
	if (kind === 'named_fish') return namedTarget(pickRandom(random, carp.filter(isWorthNaming)));
	if (kind === 'over_the_line') return { ...noTarget, targetWeightLb: theLineFor(carp), weightLb: theLineFor(carp) };
	return noTarget;
}

function namedTarget(fish: Weighed) {
	const weightLb = Number(fish.weight_lb);
	return { targetCarpId: fish.id, targetCarpName: fish.name, targetWeightLb: weightLb, weightLb };
}

export function theLineFor(carp: Weighed[]) {
	const { ShareOfBest, RoundedToLb } = TheLine;
	const line = Math.floor((bestWeightOf(carp) * ShareOfBest) / RoundedToLb) * RoundedToLb;
	return Math.max(TheLine.LowestLb, line);
}

function isWorthNaming(fish: Weighed) {
	return fish.is_catalogued && Number(fish.weight_lb) >= NamedFishFromLb;
}

function bestFishOf(carp: Weighed[]) {
	return carp.reduce((best, fish) => (Number(fish.weight_lb) > Number(best.weight_lb) ? fish : best), carp[0]);
}

function bestWeightOf(carp: Weighed[]) {
	return Number(bestFishOf(carp).weight_lb);
}
