import { anglerFactorOf, runningCostOf, takingsPerAnglerOf } from '../../src/lib/domain/groundworks/facilities';
import type { RandomFraction } from '../../src/lib/domain/random';
import { clampShare } from './draws';
import { rememberCapture, type Fish } from './fish';
import { biggestLb, pegsOf, priceBandOf, type Lake } from './lake';
import { cumulativeTakeWeights, drawTaker, takeExponentFor } from './odds';
import { Demand, Fame, RatingTerms, SponsorshipMoney, Visitors } from './rules';
import { Money } from './shelf';

export interface SeasonToday {
	growth: number;
	bite: number;
	anglers: number;
}

export function arrivalsFor(lake: Lake, season: SeasonToday) {
	const ratingShare = Math.pow(lake.rating / RatingTerms.Highest, Demand.RatingPower);
	const wanting = (Demand.FewestAnglers + Demand.MostAnglers * ratingShare) * anglerFactorOf(lake.facilities) * season.anglers * priceFactorOf(lake);
	const freePegs = Math.max(0, pegsOf(lake) - lake.today.anglers);
	return Math.max(0, Math.min(Math.round(wanting), Math.round(freePegs)));
}

function priceFactorOf(lake: Lake) {
	const band = priceBandOf(lake.rating);
	const span = band.ceiling - band.floor;
	const position = span === 0 ? 0 : clampShare((lake.price - band.floor) / span);
	return Demand.ArrivalsAtFloor + (Demand.ArrivalsAtCeiling - Demand.ArrivalsAtFloor) * position;
}

export function ticketTakingsFor(lake: Lake, arrivals: number) {
	const collection = lake.hasBailiff ? Demand.CollectionWithBailiff : Demand.CollectionWithout;
	return arrivals * lake.price * collection + arrivals * takingsPerAnglerOf(lake.facilities);
}

export function sponsorshipPerDayFor(rating: number) {
	const { FromRating, LeastPerTerm, MostPerTerm, Curve, TermDays } = SponsorshipMoney;
	if (rating < FromRating) return 0;
	const share = (rating - FromRating) / (100 - FromRating);
	return (LeastPerTerm + Math.pow(share, Curve) * (MostPerTerm - LeastPerTerm)) / TermDays;
}

export function runningCostsFor(lake: Lake) {
	return runningCostOf(lake.facilities) + (lake.hasBailiff ? Money.BailiffWage : 0);
}

export function visitorsFishForOneDay(lake: Lake, arrivals: number, season: SeasonToday, today: number, random: RandomFraction) {
	const isAnyoneFishing = arrivals > 0 && lake.fish.length > 0;
	if (!isAnyoneFishing) return 0;
	const level = lake.rating * Visitors.LevelPerRatingPoint;
	const exponent = takeExponentFor(lake.rating, level, Visitors.SessionsKnown, Visitors.TackleShare);
	const confidence = Visitors.QualityFloor + (1 - Visitors.QualityFloor) * (lake.quality / RatingTerms.Highest);
	const landed = Math.round(arrivals * Visitors.LandedPerDay * confidence * season.bite);
	const cumulative = cumulativeTakeWeights(lake.fish, exponent, biggestLb(lake), today);
	for (let index = 0; index < landed; index++) visitorLands(lake.fish[drawTaker(cumulative, random())], lake, today);
	return landed;
}

function visitorLands(fish: Fish, lake: Lake, today: number) {
	rememberCapture(fish, today);
	const isWorthTelling = fish.weightLb >= Fame.VisitorCatchFromLb;
	if (isWorthTelling) fish.fame += Fame.VisitorCatch;
	const isLakeRecord = fish.weightLb > lake.recordLb;
	if (!isLakeRecord) return;
	fish.fame += Fame.LakeRecord;
	lake.recordLb = fish.weightLb;
}
