import type { Facility } from '../../src/lib/domain/layout/layoutTypes';
import type { RegionCode } from '../../src/lib/domain/world/regionCodes';
import { regionGrowthCeiling } from '../../src/lib/domain/world/regions';
import type { Fish } from './fish';
import { CeilingTerms, Demand, Density, RatingTerms, TicketBand } from './rules';

export interface CatchDay {
	anglers: number;
	landed: number;
}

export interface Lake {
	id: number;
	ownerIndex: number;
	name: string;
	region: RegionCode;
	acres: number;
	fertility: number;
	fish: Fish[];
	swims: number;
	coverage: number;
	quality: number;
	facilities: Facility[];
	facilitiesSpent: number;
	hasBailiff: boolean;
	feedKilograms: number;
	feedProtein: number;
	price: number;
	rating: number;
	recordLb: number;
	fisheryDay: number;
	lastVisitRealDay: number;
	firstOwnedDay: Map<number, number>;
	today: CatchDay;
	catchDays: CatchDay[];
}

export interface PriceBand {
	floor: number;
	ceiling: number;
}

export function densityPerAcre(lake: Lake) {
	return lake.fish.length / lake.acres;
}

export function biomassPerAcre(lake: Lake) {
	return lake.fish.reduce((total, fish) => total + fish.weightLb, 0) / lake.acres;
}

export function biggestLb(lake: Lake) {
	return lake.fish.reduce((heaviest, fish) => Math.max(heaviest, fish.weightLb), 0);
}

export function feedingConfidenceOf(lake: Lake) {
	const { ConfidenceFloor, FullFeatureShare } = CeilingTerms;
	return ConfidenceFloor + (1 - ConfidenceFloor) * Math.min(1, lake.coverage / FullFeatureShare);
}

export function ceilingLbOf(lake: Lake) {
	const crowding = Math.min(1, densityPerAcre(lake) / Density.CrowdedPerAcre);
	const mouthPressure = CeilingTerms.MouthsFloor + (1 - CeilingTerms.MouthsFloor) * (1 - crowding);
	const qualityFactor = CeilingTerms.QualityFloor + (1 - CeilingTerms.QualityFloor) * (lake.quality / RatingTerms.Highest);
	return regionGrowthCeiling(lake.region) * mouthPressure * feedingConfidenceOf(lake) * qualityFactor;
}

export function priceBandOf(rating: number): PriceBand {
	const floor = Math.max(TicketBand.LeastPrice, rating * TicketBand.FloorPerRatingPoint);
	return { floor, ceiling: Math.max(floor, rating * TicketBand.CeilingPerRatingPoint) };
}

export function pegsOf(lake: Lake) {
	return lake.swims * Demand.PegsPerSwim;
}

export function closeTheCatchDay(lake: Lake) {
	lake.catchDays = [...lake.catchDays, lake.today].slice(-RatingTerms.CatchWindowDays);
	lake.today = { anglers: 0, landed: 0 };
}

export function isOpen(lake: Lake, fishToOpen: number) {
	return lake.fish.length >= fishToOpen;
}
