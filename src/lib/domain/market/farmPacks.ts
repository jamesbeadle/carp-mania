import { seededRandom } from '../random';
import { guidePriceOf } from './valuation';
import { fisheryWeekNumber } from './fishFarm';
import { GradeCatalogue, type Farm, type FarmGrade } from './farms';

export interface SizeBand {
	key: string;
	fromLb: number;
	toLb: number;
	ageYears: number;
}

export interface FarmPack {
	id: string;
	farmId: string;
	band: SizeBand;
	count: number;
	price: number;
	conditionLowest: number;
	conditionHighest: number;
}

export const SizeBands: SizeBand[] = [
	{ key: 'stockies', fromLb: 4, toLb: 6, ageYears: 2 },
	{ key: 'doubles', fromLb: 8, toLb: 12, ageYears: 4 },
	{ key: 'mid_doubles', fromLb: 14, toLb: 18, ageYears: 6 },
	{ key: 'twenties', fromLb: 20, toLb: 25, ageYears: 9 },
	{ key: 'high_twenties', fromLb: 26, toLb: 28, ageYears: 11 },
	{ key: 'thirties', fromLb: 30, toLb: 36, ageYears: 13 },
	{ key: 'forties', fromLb: 38, toLb: 44, ageYears: 16 },
	{ key: 'fifties', fromLb: 48, toLb: 55, ageYears: 19 }
];

const PackCountByGrade: Record<FarmGrade, { smallest: number; largest: number }> = {
	stock: { smallest: 20, largest: 200 },
	good: { smallest: 5, largest: 50 },
	specialist: { smallest: 1, largest: 10 },
	record: { smallest: 1, largest: 2 }
};
const RecordFarmWeekOff = 0.35;
const RecordFarmBandsOffered = 2;
const PriceRounding = 50;
const PackSalt = 7919;

export function packsFor(farm: Farm, now: Date): FarmPack[] {
	const week = fisheryWeekNumber(now);
	const random = seededRandom(week * PackSalt + hashOf(farm.id));
	if (farm.grade === 'record') return recordPacksFor(farm, week, random);
	return bandsSoldBy(farm).map((band) => packFor(farm, band, week, random()));
}

function bandsSoldBy(farm: Farm) {
	const grade = GradeCatalogue[farm.grade];
	return SizeBands.filter((band) => band.toLb <= grade.sellsUpToLb);
}

function recordPacksFor(farm: Farm, week: number, random: () => number): FarmPack[] {
	const isWeekOff = random() < RecordFarmWeekOff;
	if (isWeekOff) return [];
	const biggestBands = bandsSoldBy(farm).slice(-RecordFarmBandsOffered);
	const band = biggestBands[Math.floor(random() * biggestBands.length)];
	return [packFor(farm, band, week, random())];
}

function packFor(farm: Farm, band: SizeBand, week: number, roll: number): FarmPack {
	const grade = GradeCatalogue[farm.grade];
	const { smallest, largest } = PackCountByGrade[farm.grade];
	const count = Math.round(smallest + roll * (largest - smallest));
	const { lowest, highest } = grade.condition;
	const price = packPriceFor(band, grade.priceFactor, highest);
	const id = `${farm.id}-${week}-${band.key}`;
	return { id, farmId: farm.id, band, count, price, conditionLowest: lowest, conditionHighest: highest };
}

export function packPriceFor(band: SizeBand, priceFactor: number, condition: number) {
	const midpointLb = (band.fromLb + band.toLb) / 2;
	const guide = guidePriceOf({ weight_lb: midpointLb, strain: 'common', condition, fame: 0 });
	return Math.max(PriceRounding, Math.round((guide * priceFactor) / PriceRounding) * PriceRounding);
}

export function packFishPrice(pack: FarmPack, count: number) {
	return pack.price * count;
}

function hashOf(text: string) {
	let hash = 0;
	for (const character of text) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
	return hash;
}
