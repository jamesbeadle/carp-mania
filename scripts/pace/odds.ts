import type { Fish } from './fish';
import { appetiteOf, warinessOf } from './fish';
import { Odds } from './rules';

export function takeExponentFor(lakeRating: number, level: number, sessionsHere: number, tackleShare: number) {
	const lakePull = Odds.LakeRatingPull * (lakeRating / 100);
	const levelPull = Odds.LevelPull * Math.min(1, level / Odds.LevelForFullPull);
	const knowledgePull = Odds.KnowledgePull * Math.min(1, sessionsHere / Odds.SessionsForFullKnowledge);
	const tacklePull = Odds.TacklePull * tackleShare;
	return Math.max(Odds.Floor, Odds.Start - lakePull - levelPull - knowledgePull - tacklePull);
}

export function cumulativeTakeWeights(fish: Fish[], exponent: number, biggestLb: number, today: number) {
	const cumulative = new Float64Array(fish.length);
	let running = 0;
	for (let index = 0; index < fish.length; index++) {
		running += takeWeightOf(fish[index], exponent, biggestLb, today);
		cumulative[index] = running;
	}
	return cumulative;
}

function takeWeightOf(fish: Fish, exponent: number, biggestLb: number, today: number) {
	const sizeBias = Math.pow(fish.weightLb / biggestLb, -exponent);
	return sizeBias * appetiteOf(fish) * (1 - warinessOf(fish, today));
}

export function drawTaker(cumulative: Float64Array, roll: number) {
	const target = roll * cumulative[cumulative.length - 1];
	let low = 0;
	let high = cumulative.length - 1;
	while (low < high) {
		const middle = (low + high) >> 1;
		const isBelowTarget = cumulative[middle] < target;
		if (isBelowTarget) {
			low = middle + 1;
			continue;
		}
		high = middle;
	}
	return low;
}

export function chanceOfTheBiggest(fish: Fish[], exponent: number, today: number) {
	const biggestLb = fish.reduce((heaviest, one) => Math.max(heaviest, one.weightLb), 0);
	const cumulative = cumulativeTakeWeights(fish, exponent, biggestLb, today);
	const total = cumulative[cumulative.length - 1];
	const heaviest = fish.reduce((found, one, index) => (one.weightLb === biggestLb ? index : found), 0);
	const weightOfTheBiggest = cumulative[heaviest] - (heaviest === 0 ? 0 : cumulative[heaviest - 1]);
	return weightOfTheBiggest / total;
}
