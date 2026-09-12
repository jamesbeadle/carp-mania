import { ageForFarmFish, FarmFishCondition } from '../market/fishFarm';
import { carpNameForIndex } from '../naming/carpNames';
import { pickRandom, randomBetween, type RandomFraction } from '../random';
import { pickStrain } from '../strains';
import type { Carp, CarpOrigin, CarpStrain, SiteType } from '../types';
import type { RegionCode } from '../world/regionCodes';
import { SiteCatalogue, type StartingStockRule } from './siteCatalogue';

export const NamedThirty = { MinimumLb: 30, MaximumLb: 33, Strains: ['mirror', 'common'] as CarpStrain[] } as const;
const WildCondition = { Minimum: 60, Maximum: 90 } as const;
const WildAge = { BaseYears: 3, PoundsPerYear: 3 } as const;
const QuartersPerPound = 4;

interface CarpFacts {
	lakeId: string;
	origin: CarpOrigin;
	isCatalogued: boolean;
	name: string;
	strain: CarpStrain;
	weightLb: number;
	condition: number;
}

export function startingCarpFor(site: SiteType, lakeId: string, region: RegionCode, random: RandomFraction): Omit<Carp, 'id'>[] {
	const profile = SiteCatalogue[site];
	const stock: Omit<Carp, 'id'>[] = [];
	for (const rule of profile.stock) {
		const count = Math.round(randomBetween(random, rule.minimumCount, rule.maximumCount));
		for (let index = 0; index < count; index++) stock.push(carpFromRule(rule, lakeId, region, stock.length, random));
	}
	for (const name of profile.namedThirties) stock.push(namedThirty(name, lakeId, random));
	return stock;
}

function carpFromRule(rule: StartingStockRule, lakeId: string, region: RegionCode, nameIndex: number, random: RandomFraction) {
	const [minimumCondition, maximumCondition] = conditionRangeFor(rule.origin);
	return carpRow({
		lakeId,
		origin: rule.origin,
		isCatalogued: rule.isCatalogued,
		name: carpNameForIndex(nameIndex),
		strain: pickStrain(random(), region),
		weightLb: roundToQuarterPound(randomBetween(random, rule.minimumLb, rule.maximumLb)),
		condition: Math.round(randomBetween(random, minimumCondition, maximumCondition))
	});
}

function namedThirty(name: string, lakeId: string, random: RandomFraction) {
	return carpRow({
		lakeId,
		origin: 'wild',
		isCatalogued: true,
		name,
		strain: pickRandom(random, NamedThirty.Strains),
		weightLb: roundToQuarterPound(randomBetween(random, NamedThirty.MinimumLb, NamedThirty.MaximumLb)),
		condition: Math.round(randomBetween(random, WildCondition.Minimum, WildCondition.Maximum))
	});
}

function carpRow(facts: CarpFacts): Omit<Carp, 'id'> {
	return {
		lake_id: facts.lakeId,
		name: facts.name,
		strain: facts.strain,
		weight_lb: facts.weightLb,
		age_years: ageFor(facts.origin, facts.weightLb),
		condition: facts.condition,
		times_caught: 0,
		origin: facts.origin,
		origin_lake_id: facts.lakeId,
		fame: 0,
		is_catalogued: facts.isCatalogued,
		transit_until: null,
		quarantine_until: null
	};
}

export function ageFor(origin: CarpOrigin, weightLb: number) {
	if (origin === 'farm') return ageForFarmFish(weightLb);
	return Math.round(WildAge.BaseYears + weightLb / WildAge.PoundsPerYear);
}

function conditionRangeFor(origin: CarpOrigin): [number, number] {
	if (origin === 'farm') return [FarmFishCondition.Minimum, FarmFishCondition.Maximum];
	return [WildCondition.Minimum, WildCondition.Maximum];
}

function roundToQuarterPound(value: number) {
	return Math.round(value * QuartersPerPound) / QuartersPerPound;
}
