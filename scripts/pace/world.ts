import { randomBetween, seededRandom, type RandomFraction } from '../../src/lib/domain/random';
import { SiteCatalogue, sitePriceFor } from '../../src/lib/domain/sites/siteCatalogue';
import { newFish } from './fish';
import { potentialFor } from './potential';
import { runLakeDay } from './fisheryDay';
import type { Lake } from './lake';
import { isActiveOn, newPlayer, playTheDay, type Player } from './players';
import { Archetypes, Roster, Sites, type SitePreset } from './roster';
import { FisheryClock } from '../../src/lib/domain/simulation/elapsedDays';
import { Clock, DiaryDays, RatingBands } from './rules';
import { ladderRowAt, noteTheDay, writeTheDiary, type DiaryEntry, type LadderRow, type TakingsByBand } from './ledger';
import type { Records } from './session';
import { FillBand, Money } from './shelf';
import { buyFish } from './shopping';

export interface World {
	random: RandomFraction;
	players: Player[];
	lakes: Lake[];
	fisheryDay: number;
	records: Records;
	ladder: LadderRow[];
	diary: DiaryEntry[];
	diedOfOldAge: number;
	takings: TakingsByBand[];
}

const StartingSwims = 4;
const NoDugAcres = 0;
const WildCondition = { Lowest: 60, Highest: 90 } as const;
const WildAgeYears = 5;

export function buildWorld(seed: number): World {
	const random = seededRandom(seed);
	const players: Player[] = [];
	for (const line of Roster) for (let count = 0; count < line.count; count++) players.push(founded(players.length, line.archetype, Sites[line.site], random));
	const takings = Array.from({ length: RatingBands }, () => ({ days: 0, income: 0, costs: 0 }));
	return { random, players, lakes: players.map((player) => player.lake), fisheryDay: 0, records: { worldLb: 0 }, ladder: [], diary: [], diedOfOldAge: 0, takings };
}

function founded(index: number, archetype: keyof typeof Archetypes, site: SitePreset, random: RandomFraction): Player {
	const lake = newLake(index, site, random);
	const money = Money.StartingFloat - sitePriceFor(site.site, site.region, site.acres, NoDugAcres);
	const player = newPlayer(index, Archetypes[archetype], site, lake, money);
	buyFish(player, lake, FillBand, Math.max(0, Money.FishToOpen - lake.fish.length), random);
	return player;
}

function wildFish(weightLb: number, random: RandomFraction) {
	return newFish(weightLb, randomBetween(random, WildCondition.Lowest, WildCondition.Highest), WildAgeYears, potentialFor('common', weightLb, random));
}

function newLake(index: number, site: SitePreset, random: RandomFraction): Lake {
	const { count, fromLb, toLb } = site.startingFish;
	const fish = Array.from({ length: count }, () => wildFish(randomBetween(random, fromLb, toLb), random));
	const fertility = SiteCatalogue[site.site].startingFertility;
	return {
		id: index, ownerIndex: index, name: `${site.key}-${index}`, region: site.region, acres: site.acres, fertility, fish,
		swims: StartingSwims, coverage: site.coverage, quality: site.quality, facilities: [], facilitiesSpent: 0, hasBailiff: false,
		feedKilograms: 0, feedProtein: 0, price: 0, rating: 0, recordLb: 0, fisheryDay: 0, lastVisitRealDay: 0, firstOwnedDay: new Map(),
		today: { anglers: 0, landed: 0 }, catchDays: []
	};
}

export function simulateTheYear(world: World) {
	for (let realDay = 0; realDay < Clock.RealDaysSimulated; realDay++) {
		playersPlay(world, realDay);
		world.fisheryDay += Clock.FisheryDaysPerRealDay;
		for (const lake of world.lakes) runTheDaysSinceTheOwnerLastLooked(world, lake, realDay);
		const isMonthEnd = (realDay + 1) % Clock.RealDaysPerMonth === 0;
		if (isMonthEnd) world.ladder.push(ladderRowAt(world, realDay));
		const isDiaryDay = (DiaryDays as readonly number[]).includes(realDay + 1);
		if (isDiaryDay) writeTheDiary(world, realDay + 1);
	}
}

function playersPlay(world: World, realDay: number) {
	const season = { growth: 1, bite: 1, anglers: 1 };
	const day = { today: world.fisheryDay, realDay, season, records: world.records, random: world.random };
	for (const player of world.players) if (isActiveOn(player, realDay)) playTheDay(player, world.players, world.lakes, day);
}

function runTheDaysSinceTheOwnerLastLooked(world: World, lake: Lake, realDay: number) {
	const owner = world.players[lake.ownerIndex];
	if (!isActiveOn(owner, realDay)) return;
	const elapsed = Clock.FisheryDaysPerRealDay * (realDay + 1 - lake.lastVisitRealDay);
	const daysToRun = Math.min(FisheryClock.MaximumDaysSimulatedPerVisit, elapsed);
	lake.lastVisitRealDay = realDay + 1;
	for (let count = 0; count < daysToRun; count++) runOneLakeDay(world, lake, realDay);
}

function runOneLakeDay(world: World, lake: Lake, realDay: number) {
	lake.fisheryDay += 1;
	const day = { fisheryDay: lake.fisheryDay, realDay, random: world.random };
	noteTheDay(world, lake, runLakeDay(lake, world.players[lake.ownerIndex], day));
}
