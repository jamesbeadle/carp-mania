import type { Lake } from '../types';
import { RegionCatalogue } from './regions';
import { dayOfFisheryYear, hemisphereOf, seasonFraction, seasonNameFor, type SeasonName } from './worldClock';

export interface Season {
	name: SeasonName;
	fraction: number;
	growthFactor: number;
	biteFactor: number;
	anglerFactor: number;
	isSummer: boolean;
	isWinter: boolean;
}

const BiteSwing = { Floor: 0.5, Range: 0.5 } as const;
const AnglerSwing = { Floor: 0.6, Range: 0.4 } as const;

export function seasonFor(lake: Pick<Lake, 'region' | 'latitude'>, now: Date): Season {
	const hemisphere = hemisphereOf(lake.latitude);
	const dayOfYear = dayOfFisheryYear(now);
	const fraction = seasonFraction(dayOfYear, hemisphere);
	const region = RegionCatalogue[lake.region];
	const name = seasonNameFor(dayOfYear, hemisphere);
	return {
		name,
		fraction,
		growthFactor: region.winterGrowthFactor + (region.summerGrowthFactor - region.winterGrowthFactor) * fraction,
		biteFactor: BiteSwing.Floor + BiteSwing.Range * fraction,
		anglerFactor: AnglerSwing.Floor + AnglerSwing.Range * fraction,
		isSummer: name === 'summer',
		isWinter: name === 'winter'
	};
}

export function yearlyAverageGrowthFactor(lake: Pick<Lake, 'region'>) {
	const region = RegionCatalogue[lake.region];
	return (region.summerGrowthFactor + region.winterGrowthFactor) / 2;
}
