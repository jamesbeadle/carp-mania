import type { WaterToday } from '../src/lib/domain/fishing/biteRoll';
import { seededRandom } from '../src/lib/domain/random';
import { classicCarp } from '../src/lib/domain/sites/classicSite';
import type { Carp, Lake } from '../src/lib/domain/types';
import { seasonFor } from '../src/lib/domain/world/seasons';
import { weatherFor } from '../src/lib/domain/world/weather';

const ThirtyLb = 30;

export function waterOn(lake: Lake, rating: number, day: string): WaterToday {
	const date = new Date(day);
	return { lake, rating, watercraft: rating, season: seasonFor(lake, date), weather: weatherFor(lake, date), shoals: [] };
}

export function stockWithThirties(lakeId: string): Carp[] {
	const random = seededRandom(5);
	const doubles = classicCarp(lakeId, random).map((fish, index) => ({ ...fish, id: `double-${index}` }));
	const thirties = doubles.slice(0, 8).map((fish, index) => ({ ...fish, id: `thirty-${index}`, weight_lb: ThirtyLb + index }));
	return [...doubles, ...thirties];
}

