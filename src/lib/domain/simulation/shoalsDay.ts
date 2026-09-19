import { PikeRules } from '../economy';
import type { RandomFraction } from '../random';
import { namedOffTheTop, type NewNamedFish } from '../stock/individualise';
import { isShoalWorthNaming, type Shoal } from '../stock/shoals';
import type { Lake } from '../types';
import { clampToScale } from '../waterQuality';
import type { RegionCode } from '../world/regionCodes';

export interface ShoalMeal {
	shoals: Shoal[];
	eaten: number;
}

const HungriestShare = 0.5;

export function pikeEatFromShoals(shoals: Shoal[], pikeCount: number, acres: number, random: RandomFraction): ShoalMeal {
	if (pikeCount === 0) return { shoals, eaten: 0 };
	let eaten = 0;
	const fed = shoals.map((shoal) => {
		const isSmallEnough = shoal.size_band === 'fry' || shoal.size_band === 'singles';
		if (!isSmallEnough || shoal.count === 0) return shoal;
		const appetite = pikeCount * PikeRules.FoodEatenPerPikePerDay * HungriestShare;
		const taken = Math.min(shoal.count, Math.round(appetite * random()));
		eaten += taken;
		return { ...shoal, count: shoal.count - taken };
	});
	return { shoals: fed, eaten };
}

export function shoalsSufferHeatwave(shoals: Shoal[], conditionLoss: number): Shoal[] {
	return shoals.map((shoal) => ({ ...shoal, condition: clampToScale(Number(shoal.condition) - conditionLoss) }));
}

export function ageShoals(shoals: Shoal[]): Shoal[] {
	return shoals.map((shoal) => ({ ...shoal, age_years: shoal.age_years + 1 }));
}

export function lapseShoalTransfers(shoals: Shoal[], at: Date): Shoal[] {
	return shoals.map((shoal) => {
		const arrived = hasLapsed(shoal.transit_until, at) ? { ...shoal, transit_until: null } : shoal;
		const isOutOfQuarantine = arrived.transit_until === null && hasLapsed(arrived.quarantine_until, at);
		return isOutOfQuarantine ? { ...arrived, quarantine_until: null } : arrived;
	});
}

function hasLapsed(until: string | null, at: Date) {
	return until !== null && new Date(until).getTime() <= at.getTime();
}

export function nameTheTopOfEachShoal(lake: Pick<Lake, 'region'>, shoals: Shoal[], namedCount: number, random: RandomFraction) {
	const named: NewNamedFish[] = [];
	const trimmed = shoals.map((shoal) => {
		if (!isShoalWorthNaming(shoal)) return shoal;
		const split = namedOffTheTop(shoal, random, namedCount + named.length, lake.region as RegionCode);
		named.push(...split.fish);
		return split.shoal;
	});
	return { shoals: trimmed.filter((shoal) => shoal.count > 0), named };
}
