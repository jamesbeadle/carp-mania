import type { Terrain } from '../layout/terrainAt';
import type { Season } from '../world/seasons';
import type { SwimFeature } from '../types';

export const DepthBands = { ShallowUpToFeet: 4, DeepFromFeet: 12 } as const;

const ShallowFactor = { Summer: 1.15, Winter: 0.7 } as const;
const DeepFactor = { Summer: 0.9, Winter: 1.25 } as const;
const RockWithNothingToEat = 0.6;

const FeatureBiteFactor: Record<SwimFeature, number> = {
	open_water: 1,
	island_margin: 1.15,
	snag: 1.2,
	gravel_bar: 1.1,
	weed_bed: 1.1,
	lily_pads: 1.15,
	reed_line: 1.05
};

const SummerOnlyFeatures: SwimFeature[] = ['weed_bed', 'lily_pads'];

export function depthFactor(terrain: Terrain, season: Pick<Season, 'isSummer' | 'isWinter'>) {
	if (terrain.depthFeet <= DepthBands.ShallowUpToFeet) return seasonal(ShallowFactor, season);
	if (terrain.depthFeet >= DepthBands.DeepFromFeet) return seasonal(DeepFactor, season);
	return 1;
}

export function featureFactor(terrain: Terrain, season: Pick<Season, 'isSummer' | 'isWinter'>) {
	const isDormant = SummerOnlyFeatures.includes(terrain.feature) && !season.isSummer;
	if (isDormant) return terrain.feature === 'lily_pads' ? 1 : FeatureBiteFactor.open_water;
	return FeatureBiteFactor[terrain.feature];
}

export function bedFactor(terrain: Terrain) {
	const isBareRock = terrain.bed === 'rock' && terrain.feature !== 'gravel_bar';
	return isBareRock ? RockWithNothingToEat : 1;
}

export function spotBiteFactor(terrain: Terrain, season: Pick<Season, 'isSummer' | 'isWinter'>) {
	return depthFactor(terrain, season) * featureFactor(terrain, season) * bedFactor(terrain);
}

function seasonal(factor: { Summer: number; Winter: number }, season: Pick<Season, 'isSummer' | 'isWinter'>) {
	if (season.isSummer) return factor.Summer;
	if (season.isWinter) return factor.Winter;
	return 1;
}
