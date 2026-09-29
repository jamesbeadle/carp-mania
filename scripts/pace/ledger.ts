import type { LakeDayOutcome } from './fisheryDay';
import { biggestLb, type Lake } from './lake';
import { Clock, RatingBands, RatingTerms } from './rules';
import type { World } from './world';

export interface LadderRow {
	month: number;
	biggestLb: number;
	forties: number;
	fifties: number;
	topRating: number;
	diedOfOldAge: number;
}

export interface DiaryEntry {
	archetype: string;
	realDay: number;
	rating: number;
	money: number;
	level: number;
	biggestLb: number;
	personalBestLb: number;
}

export interface TakingsByBand {
	days: number;
	income: number;
	costs: number;
}


export function noteTheDay(world: World, lake: Lake, outcome: LakeDayOutcome) {
	world.diedOfOldAge += outcome.diedOfOldAge;
	const band = world.takings[Math.min(RatingBands - 1, Math.floor(lake.rating / (RatingTerms.Highest / RatingBands)))];
	band.days += 1;
	band.income += outcome.income;
	band.costs += outcome.costs;
}

export function writeTheDiary(world: World, realDay: number) {
	const seen = new Set<string>();
	for (const player of world.players) {
		const name = player.archetype.name;
		if (seen.has(name)) continue;
		seen.add(name);
		const { lake, angler } = player;
		world.diary.push({ archetype: name, realDay, rating: lake.rating, money: player.money, level: angler.level, biggestLb: biggestLb(lake), personalBestLb: angler.personalBestLb });
	}
}

export function ladderRowAt(world: World, realDay: number): LadderRow {
	const fish = world.lakes.flatMap((lake) => lake.fish);
	return {
		month: Math.round((realDay + 1) / Clock.RealDaysPerMonth),
		biggestLb: world.lakes.reduce((heaviest, lake) => Math.max(heaviest, biggestLb(lake)), 0),
		forties: fish.filter((one) => one.weightLb >= 40).length,
		fifties: fish.filter((one) => one.weightLb >= 50).length,
		topRating: world.lakes.reduce((top, lake) => Math.max(top, lake.rating), 0),
		diedOfOldAge: world.diedOfOldAge
	};
}
