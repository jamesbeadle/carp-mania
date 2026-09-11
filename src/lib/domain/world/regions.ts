import type { CarpStrain } from '../types';
import type { RegionCode } from './regionCodes';

export interface RegionBounds {
	west: number;
	east: number;
	south: number;
	north: number;
}

export interface RegionProfile {
	label: string;
	landPricePerAcre: number;
	summerGrowthFactor: number;
	winterGrowthFactor: number;
	growthCeilingLb: number;
	anglerPoolFactor: number;
	willingnessToPayFactor: number;
	strainLean: Partial<Record<CarpStrain, number>>;
	bounds: RegionBounds;
	flavour: string;
}

export const RegionCatalogue: Record<RegionCode, RegionProfile> = {
	uk_ireland: { label: 'UK & Ireland', landPricePerAcre: 2500, summerGrowthFactor: 1.0, winterGrowthFactor: 0.35, growthCeilingLb: 68, anglerPoolFactor: 1.2, willingnessToPayFactor: 1.0, strainLean: {}, bounds: { west: -11, east: 2, south: 49.5, north: 61 }, flavour: 'Day-ticket country. Gravel pits, syndicates, bailiffs, and more anglers per acre than anywhere on Earth.' },
	france: { label: 'France', landPricePerAcre: 1600, summerGrowthFactor: 1.2, winterGrowthFactor: 0.5, growthCeilingLb: 100, anglerPoolFactor: 0.8, willingnessToPayFactor: 1.3, strainLean: { mirror: 0.45, linear: 0.15 }, bounds: { west: -5, east: 9.6, south: 42, north: 51.2 }, flavour: 'Big mirrors in big étangs. Fewer anglers, but they pay for the privilege.' },
	benelux_germany: { label: 'Benelux & Germany', landPricePerAcre: 2200, summerGrowthFactor: 1.05, winterGrowthFactor: 0.35, growthCeilingLb: 80, anglerPoolFactor: 1.0, willingnessToPayFactor: 1.1, strainLean: {}, bounds: { west: 2, east: 15.5, south: 47, north: 55.5 }, flavour: 'Canals, polders and tidy fisheries with a strong bailiff culture.' },
	iberia: { label: 'Spain & Portugal', landPricePerAcre: 1100, summerGrowthFactor: 1.35, winterGrowthFactor: 0.8, growthCeilingLb: 90, anglerPoolFactor: 0.7, willingnessToPayFactor: 1.1, strainLean: { common: 0.5 }, bounds: { west: -10, east: 4.5, south: 35.5, north: 44 }, flavour: 'Reservoirs and the Ebro. A season that barely ends and water you can see the bottom of.' },
	italy_balkans: { label: 'Italy & the Balkans', landPricePerAcre: 1300, summerGrowthFactor: 1.3, winterGrowthFactor: 0.7, growthCeilingLb: 95, anglerPoolFactor: 0.7, willingnessToPayFactor: 1.0, strainLean: { common: 0.45 }, bounds: { west: 6, east: 30, south: 35, north: 47 }, flavour: 'Huge commons from the Po to the Danube delta.' },
	central_europe: { label: 'Hungary, Austria, Czechia & Poland', landPricePerAcre: 800, summerGrowthFactor: 1.4, winterGrowthFactor: 0.4, growthCeilingLb: 105, anglerPoolFactor: 0.9, willingnessToPayFactor: 0.9, strainLean: { mirror: 0.5 }, bounds: { west: 9, east: 25, south: 45.5, north: 55 }, flavour: 'Monster-mirror country. Cheap land, hot summers, hard winters.' },
	danube: { label: 'Romania & the Danube', landPricePerAcre: 600, summerGrowthFactor: 1.4, winterGrowthFactor: 0.45, growthCeilingLb: 105, anglerPoolFactor: 0.6, willingnessToPayFactor: 0.8, strainLean: { mirror: 0.45 }, bounds: { west: 20, east: 30, south: 43, north: 48.5 }, flavour: 'The cheapest land in the game and the biggest fish. Bring your own anglers.' },
	north_america: { label: 'USA & Canada', landPricePerAcre: 1400, summerGrowthFactor: 1.15, winterGrowthFactor: 0.4, growthCeilingLb: 60, anglerPoolFactor: 0.5, willingnessToPayFactor: 0.8, strainLean: { common: 0.7 }, bounds: { west: -170, east: -50, south: 24, north: 72 }, flavour: 'Carp are under-fished here — cheap land, fast growth, half the anglers.' },
	south_africa: { label: 'South Africa', landPricePerAcre: 700, summerGrowthFactor: 1.3, winterGrowthFactor: 0.8, growthCeilingLb: 60, anglerPoolFactor: 0.5, willingnessToPayFactor: 0.8, strainLean: { common: 0.55 }, bounds: { west: 16, east: 33, south: -35, north: -22 }, flavour: 'Dams in the sun. Seasons run the other way round.' },
	australia_nz: { label: 'Australia & New Zealand', landPricePerAcre: 900, summerGrowthFactor: 1.25, winterGrowthFactor: 0.75, growthCeilingLb: 55, anglerPoolFactor: 0.5, willingnessToPayFactor: 0.8, strainLean: { common: 0.6 }, bounds: { west: 112, east: 180, south: -48, north: -10 }, flavour: 'A long warm season on the far side of the world. Christmas is midsummer.' },
	japan_east_asia: { label: 'Japan & East Asia', landPricePerAcre: 3200, summerGrowthFactor: 1.1, winterGrowthFactor: 0.5, growthCeilingLb: 70, anglerPoolFactor: 0.9, willingnessToPayFactor: 1.2, strainLean: { ghost: 0.2 }, bounds: { west: 100, east: 146, south: 20, north: 46 }, flavour: 'Koi heritage: ghosts and pale fish are common, land is dear, anglers pay well.' }
};

export function regionGrowthCeiling(region: RegionCode) {
	return RegionCatalogue[region].growthCeilingLb;
}

export function landPriceFor(region: RegionCode, acres: number) {
	return RegionCatalogue[region].landPricePerAcre * acres;
}

export function isInsideRegion(region: RegionCode, latitude: number, longitude: number) {
	const { west, east, south, north } = RegionCatalogue[region].bounds;
	return latitude >= south && latitude <= north && longitude >= west && longitude <= east;
}
