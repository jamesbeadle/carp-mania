import type { Terrain } from '../layout/terrainAt';
import { seededRandom } from '../random';
import type { RodSetup } from '../tackle/rodSetup';
import type { Lake } from '../types';
import type { Season } from '../world/seasons';
import { biteChanceForOneHour } from './biteChance';
import { mix } from './sessionSeed';
import { spotBiteFactor } from './spotFactor';
import { matchTackleToWater } from './tackleMatch';

const MinutesPerHour = 60;

export interface BiteRoll {
	isTaking: boolean;
	minuteOfHour: number;
	carpIndexRoll: number;
}

export interface RodInTheWater {
	terrain: Terrain;
	setup: RodSetup;
}

export interface WaterToday {
	lake: Lake;
	rating: number;
	watercraft: number;
	season: Season;
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
	const match = matchTackleToWater(rod.setup, water.lake, rod.terrain);
	const season = water.season;
	const conditions = { spotFactor: spotBiteFactor(rod.terrain, season), seasonFactor: season.biteFactor };
	return biteChanceForOneHour(water.lake, match.overall, water.rating, hour, conditions);
}

export function biteTimeOf(hour: number, roll: BiteRoll) {
	return hour + roll.minuteOfHour / MinutesPerHour;
}
