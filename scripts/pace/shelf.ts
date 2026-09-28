import type { Facility } from '../../src/lib/domain/layout/layoutTypes';
import type { FarmGrade } from '../../src/lib/domain/market/farms';
import type { Bloodline } from './potential';

export interface GuideBand {
	fromLb: number;
	toLb: number;
	poundsPerLb: number;
}

export const GuideBands: GuideBand[] = [
	{ fromLb: 0, toLb: 10, poundsPerLb: 30 },
	{ fromLb: 10, toLb: 20, poundsPerLb: 70 },
	{ fromLb: 20, toLb: 30, poundsPerLb: 200 },
	{ fromLb: 30, toLb: 40, poundsPerLb: 1000 },
	{ fromLb: 40, toLb: 50, poundsPerLb: 3000 },
	{ fromLb: 50, toLb: Number.POSITIVE_INFINITY, poundsPerLb: 8000 }
];

export interface FarmBand {
	key: string;
	grade: FarmGrade;
	ratingNeeded: number;
	fromLb: number;
	toLb: number;
	ageYears: number;
	priceFactor: number;
	bloodline: Bloodline;
	condition: { lowest: number; highest: number };
}

export const FarmShelf: FarmBand[] = [
	{ key: 'stockies', grade: 'stock', ratingNeeded: 0, fromLb: 4, toLb: 6, ageYears: 2, priceFactor: 0.8, bloodline: 'common', condition: { lowest: 75, highest: 85 } },
	{ key: 'doubles', grade: 'stock', ratingNeeded: 0, fromLb: 8, toLb: 12, ageYears: 4, priceFactor: 0.8, bloodline: 'common', condition: { lowest: 75, highest: 85 } },
	{ key: 'mid_doubles', grade: 'good', ratingNeeded: 25, fromLb: 14, toLb: 18, ageYears: 6, priceFactor: 1, bloodline: 'common', condition: { lowest: 80, highest: 90 } },
	{ key: 'twenties', grade: 'good', ratingNeeded: 25, fromLb: 20, toLb: 24, ageYears: 9, priceFactor: 1, bloodline: 'common', condition: { lowest: 80, highest: 90 } },
	{ key: 'low_thirties', grade: 'specialist', ratingNeeded: 50, fromLb: 28, toLb: 32, ageYears: 13, priceFactor: 1.4, bloodline: 'common', condition: { lowest: 85, highest: 92 } },
	{ key: 'high_thirties', grade: 'record', ratingNeeded: 75, fromLb: 34, toLb: 38, ageYears: 16, priceFactor: 4, bloodline: 'record', condition: { lowest: 88, highest: 95 } }
];

export const FarmTerms = { DeliveryPerOrder: 250, PriceRounding: 50 } as const;
export const FillBand = FarmShelf[1];

export const Money = {
	StartingFloat: 100000,
	ReserveDays: 5,
	SwimCost: 350,
	SwimsPerAcre: 1,
	GroundworksStep: 5000,
	CoveragePerStep: 0.05,
	MostCoverage: 0.3,
	BailiffWage: 60,
	FeedDaysBought: 168,
	KilogramsPerHundredFishPerDay: 4,
	FishToOpen: 100,
	TicketBudgetShare: 0.05,
	LeastTicketBudget: 40
} as const;

export interface FeedChoice {
	pricePerKilogram: number;
	protein: number;
}

export const Feeds: Record<'fishmeal' | 'hemp', FeedChoice> = {
	fishmeal: { pricePerKilogram: 9, protein: 1 },
	hemp: { pricePerKilogram: 2.5, protein: 0.35 }
};

export const FacilityOrder: Facility[] = ['car_park', 'toilets', 'lodge', 'aerator', 'tackle_shop', 'washrooms', 'bar', 'club_house', 'restaurant', 'estate_house', 'hotel'];
