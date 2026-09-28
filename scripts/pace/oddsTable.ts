import { newFish, type Fish } from './fish';
import { chanceOfTheBiggest, takeExponentFor } from './odds';
import { Bites } from './rules';
import { landChanceFor } from './session';
import { TierTackleShare } from '../../src/lib/domain/simulation/visitorTake';
import type { Tier } from '../../src/lib/domain/tackle/brands';

interface Case {
	words: string;
	lakeRating: number;
	level: number;
	sessionsHere: number;
	tier: Tier;
}

const Cases: Case[] = [
	{ words: 'a novice, first visit, starter kit, on a rating-40 water', lakeRating: 40, level: 0, sessionsHere: 0, tier: 'starter' },
	{ words: 'the same novice on a rating-80 water', lakeRating: 80, level: 0, sessionsHere: 0, tier: 'starter' },
	{ words: 'level 10, fifth visit, club kit, rating 80', lakeRating: 80, level: 10, sessionsHere: 5, tier: 'club' },
	{ words: 'level 25, twentieth visit, specialist kit, rating 80', lakeRating: 80, level: 25, sessionsHere: 20, tier: 'specialist' },
	{ words: 'level 60, twentieth visit, custom kit, rating 80', lakeRating: 80, level: 60, sessionsHere: 20, tier: 'custom' },
	{ words: 'level 60, twentieth visit, starter kit, rating 80', lakeRating: 80, level: 60, sessionsHere: 20, tier: 'starter' },
	{ words: 'level 0, twentieth visit, custom kit bought with money, rating 80', lakeRating: 80, level: 0, sessionsHere: 20, tier: 'custom' }
];

const Today = 0;
const SampleCondition = 85;
const SampleAge = 10;
const PrizeWater = { doubles: 100, twenties: 40, thirties: 8, forties: 2 } as const;

export function prizeWaterStock(): Fish[] {
	const stock: Fish[] = [];
	for (let index = 0; index < PrizeWater.doubles; index++) stock.push(sampleFish(10 + (index % 9)));
	for (let index = 0; index < PrizeWater.twenties; index++) stock.push(sampleFish(20 + (index % 9)));
	for (let index = 0; index < PrizeWater.thirties; index++) stock.push(sampleFish(30 + (index % 7)));
	stock.push(sampleFish(40), sampleFish(42));
	return stock;
}

export function oddsRows() {
	const stock = prizeWaterStock();
	return Cases.map((one) => {
		const tackleShare = TierTackleShare[one.tier];
		const exponent = takeExponentFor(one.lakeRating, one.level, one.sessionsHere, tackleShare);
		const perBite = chanceOfTheBiggest(stock, exponent, Today) * landChanceFor(42, tackleShare);
		const perSession = 1 - Math.pow(1 - perBite, Bites.PerSession);
		return [one.words, exponent.toFixed(2), percent(perBite), percent(perSession), percent(1 - Math.pow(1 - perSession, 5))];
	});
}

function sampleFish(weightLb: number) {
	return newFish(weightLb, SampleCondition, SampleAge, weightLb);
}

function percent(share: number) {
	return `${(share * 100).toFixed(2)}%`;
}
