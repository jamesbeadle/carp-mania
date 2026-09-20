import { seededRandom } from '../random';
import type { Lake } from '../types';
import { RegionCatalogue } from './regions';
import { seasonFor } from './seasons';
import { glassFor, windDirectionFor, type Glass, type WindDirection } from './weatherGlass';
import { fisheryDayNumber } from './worldClock';

export type WeatherKind = 'clear' | 'overcast' | 'rain' | 'mist' | 'heat';

export interface Weather {
	kind: WeatherKind;
	cloudCover: number;
	windStrength: number;
	glass: Glass;
	windDirection: WindDirection;
}

const Skies = { OvercastBelow: 0.28, RainBelow: 0.14, MistBelow: 0.08, HeatAbove: 0.9, HotRegionSummerGrowthFrom: 1.2 } as const;
const Cloud = { ClearMost: 0.25, OvercastLeast: 0.7, RainLeast: 0.85 } as const;
const Wind = { Calmest: 0.1, Range: 0.6, WinterExtra: 0.25, RainExtra: 0.3 } as const;
const DaySeedStride = 7919;

export function weatherFor(lake: Pick<Lake, 'id' | 'region' | 'latitude'>, now: Date): Weather {
	const random = seededRandom(fisheryDayNumber(now) * DaySeedStride + lakeSeedOf(lake.id));
	const season = seasonFor(lake, now);
	const roll = random();
	const kind = weatherKindFor(roll, season.isSummer, season.isWinter, RegionCatalogue[lake.region].summerGrowthFactor);
	const cloudCover = cloudCoverFor(kind, random());
	const windStrength = windStrengthFor(kind, season.isWinter, random());
	return { kind, cloudCover, windStrength, glass: glassFor(random(), kind === 'rain'), windDirection: windDirectionFor(random()) };
}

function weatherKindFor(roll: number, isSummer: boolean, isWinter: boolean, summerGrowthFactor: number): WeatherKind {
	if (roll < Skies.MistBelow && !isSummer) return 'mist';
	if (roll < Skies.RainBelow) return 'rain';
	if (roll < Skies.OvercastBelow || (isWinter && roll < Skies.OvercastBelow * 2)) return 'overcast';
	if (roll > Skies.HeatAbove && isSummer && summerGrowthFactor >= Skies.HotRegionSummerGrowthFrom) return 'heat';
	return 'clear';
}

function cloudCoverFor(kind: WeatherKind, roll: number) {
	if (kind === 'rain') return Cloud.RainLeast + roll * (1 - Cloud.RainLeast);
	if (kind === 'overcast') return Cloud.OvercastLeast + roll * (1 - Cloud.OvercastLeast);
	if (kind === 'mist') return Cloud.ClearMost;
	return roll * Cloud.ClearMost;
}

function windStrengthFor(kind: WeatherKind, isWinter: boolean, roll: number) {
	const base = Wind.Calmest + roll * Wind.Range;
	return Math.min(1, base + (isWinter ? Wind.WinterExtra : 0) + (kind === 'rain' ? Wind.RainExtra : 0));
}

function lakeSeedOf(lakeId: string) {
	let seed = 0;
	for (const character of lakeId) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
	return seed;
}
