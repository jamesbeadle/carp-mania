import type { RandomFraction } from '../../src/lib/domain/random';
import type { RegionCode } from '../../src/lib/domain/world/regionCodes';
import { RegionCatalogue } from '../../src/lib/domain/world/regions';
import { FisheryYear, seasonFraction } from '../../src/lib/domain/world/worldClock';
import { growForOneDay, survivesTheNewYear, type FeedingDay } from './fish';
import { biggestLb, biomassPerAcre, ceilingLbOf, closeTheCatchDay, feedingConfidenceOf, type Lake } from './lake';
import { ratingOf } from './rating';
import { Density, Growth, Milestones, Season, WaterDrift } from './rules';
import { Money } from './shelf';
import type { Purse } from './shopping';
import { arrivalsFor, runningCostsFor, sponsorshipPerDayFor, ticketTakingsFor, visitorsFishForOneDay, type SeasonToday } from './visitors';

export interface LakeDay {
	fisheryDay: number;
	realDay: number;
	random: RandomFraction;
}

export interface LakeDayOutcome {
	income: number;
	costs: number;
	diedOfOldAge: number;
}

export function seasonAt(fisheryDay: number, region: RegionCode): SeasonToday {
	const fraction = seasonFraction(fisheryDay % FisheryYear.Days, 'northern');
	const profile = RegionCatalogue[region];
	return {
		growth: profile.winterGrowthFactor + (profile.summerGrowthFactor - profile.winterGrowthFactor) * fraction,
		bite: Season.BiteFloor + Season.BiteRange * fraction,
		anglers: Season.AnglerFloor + Season.AnglerRange * fraction
	};
}

export function runLakeDay(lake: Lake, owner: Purse, day: LakeDay): LakeDayOutcome {
	const season = seasonAt(day.fisheryDay, lake.region);
	feedTheLake(lake, season);
	driftWater(lake);
	const arrivals = arrivalsFor(lake, season);
	const landed = visitorsFishForOneDay(lake, arrivals, season, day.fisheryDay, day.random);
	lake.today.anglers += arrivals;
	lake.today.landed += landed;
	const income = ticketTakingsFor(lake, arrivals) + sponsorshipPerDayFor(lake.rating);
	const costs = runningCostsFor(lake);
	owner.money += income - costs;
	closeTheCatchDay(lake);
	const diedOfOldAge = ageAtTheNewYear(lake, day);
	lake.rating = ratingOf(lake);
	noteMilestonesOwned(lake, day.realDay);
	return { income, costs, diedOfOldAge };
}

function ageAtTheNewYear(lake: Lake, day: LakeDay) {
	const isNewYear = day.fisheryDay % FisheryYear.Days === 0;
	if (!isNewYear) return 0;
	const before = lake.fish.length;
	lake.fish = lake.fish.filter((fish) => survivesTheNewYear(fish, day.random));
	return before - lake.fish.length;
}

function feedTheLake(lake: Lake, season: SeasonToday) {
	const wanted = (lake.fish.length / 100) * Money.KilogramsPerHundredFishPerDay;
	const eaten = Math.min(lake.feedKilograms, wanted);
	lake.feedKilograms -= eaten;
	const ration = wanted === 0 ? 0 : eaten / wanted;
	const natural = Growth.NaturalRationAtFullFertility * (lake.fertility / 100);
	const isLivingOffTheLake = ration === 0;
	const feeding: FeedingDay = {
		ceilingLb: ceilingLbOf(lake),
		protein: isLivingOffTheLake ? Growth.NaturalProtein : lake.feedProtein,
		fedFraction: Math.min(1, (ration + natural) * feedingConfidenceOf(lake)),
		seasonGrowth: season.growth,
		isCrowded: biomassPerAcre(lake) > Density.HeavyAboveLbPerAcre
	};
	for (const fish of lake.fish) growForOneDay(fish, feeding);
}

function driftWater(lake: Lake) {
	const hasAerator = lake.facilities.includes('aerator');
	const target = (lake.hasBailiff ? WaterDrift.TendedTarget : WaterDrift.UntendedTarget) + (hasAerator ? WaterDrift.AeratorBonus : 0);
	const step = Math.max(-WaterDrift.PerDay, Math.min(WaterDrift.PerDay, target - lake.quality));
	lake.quality = Math.min(WaterDrift.Best, lake.quality + step);
}

function noteMilestonesOwned(lake: Lake, realDay: number) {
	const heaviest = biggestLb(lake);
	for (const milestone of Milestones) {
		const isFirstOfItsKind = heaviest >= milestone && !lake.firstOwnedDay.has(milestone);
		if (isFirstOfItsKind) lake.firstOwnedDay.set(milestone, realDay);
	}
}
