import type { Terrain } from '../layout/terrainAt';
import { seededRandom } from '../random';
import type { Shoal } from '../stock/shoals';
import type { RodKit } from '../tackle/rodSetup';
import type { Lake } from '../types';
import type { Season } from '../world/seasons';
import type { Weather } from '../world/weather';
import { biteChanceForOneHour } from './biteChance';
import { mix } from './sessionSeed';
import { hourOfDay } from './sessionWindow';
import { spotBiteFactor } from './spotFactor';
import { spotSpreadFactor } from './spotSpread';
import { matchTackleToWater } from './tackleMatch';

const MinutesPerHour = 60;

export interface BiteRoll {
	isTaking: boolean;
	minuteOfHour: number;
	carpIndexRoll: number;
}

export interface RodInTheWater {
	terrain: Terrain;
	kit: RodKit;
}

export interface WaterToday {
	lake: Lake;
	rating: number;
	watercraft: number;
	season: Season;
	weather: Weather;
	shoals: Shoal[];
	difficulty: number;
}

export function biteRollFor(seed: number, rodIndex: number, hour: number, rod: RodInTheWater, water: WaterToday): BiteRoll {
	const random = seededRandom(mix(seed, rodIndex, hour));
	const takeRoll = random();
	const minuteRoll = random();
	const carpIndexRoll = random();
	return {
		isTaking: takeRoll < biteChanceThisHour(hour, rod, water),
		minuteOfHour: Math.floor(minuteRoll * MinutesPerHour),
		carpIndexRoll
	};
}

export function biteChanceThisHour(hour: number, rod: RodInTheWater, water: WaterToday) {
	const match = matchTackleToWater(rod.kit, water.lake, rod.terrain);
	const season = water.season;
	const spot = spotBiteFactor(rod.terrain, season);
	const conditions = { spotFactor: spot * spotSpreadFactor(water.difficulty, spot), seasonFactor: season.biteFactor };
	return biteChanceForOneHour(water.lake, match.overall, water.rating, hourOfDay(hour), conditions);
}

export function biteTimeOf(hour: number, roll: BiteRoll) {
	return hour + roll.minuteOfHour / MinutesPerHour;
}
