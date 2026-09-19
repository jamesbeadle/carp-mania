import type { Terrain } from '../layout/terrainAt';
import { pairingScore } from '../tackle/presentations';
import { RigCatalogue, type RigName } from '../tackle/rigs';
import type { BaitName } from '../tackle/baits';
import { BaitCatalogue } from '../tackle/baits';
import type { BedType } from '../types';
import { spotTightnessOf } from './spotTightness';

const RockFishesLike: BedType = 'gravel';
const Suitability = { BedSuits: 0.6, BedDoesNot: 0.2, FeatureSuits: 0.4, FeatureDoesNot: 0.1 } as const;
const PositionWeight = 0.35;

export function rigMatchScore(rig: RigName, terrain: Terrain, bait: BaitName | null = null) {
	const profile = RigCatalogue[rig];
	const suitability = suitabilityOf(rig, terrain) * profile.presentationScore;
	const holdsPosition = holdsPositionScore(rig, terrain);
	const pairing = bait ? pairingScore(profile, BaitCatalogue[bait].presentation) : 1;
	return suitability * holdsPosition * pairing;
}

export function holdsPositionScore(rig: RigName, terrain: Terrain) {
	const tightness = spotTightnessOf(terrain.feature);
	const drift = 1 - RigCatalogue[rig].holdsPosition;
	return 1 - drift * tightness * PositionWeight;
}

function suitabilityOf(rig: RigName, terrain: Terrain) {
	const profile = RigCatalogue[rig];
	const bed = terrain.bed === 'rock' ? RockFishesLike : terrain.bed;
	const suitsBed = profile.suitsBed.includes(bed);
	const suitsFeature = profile.suitsFeature.includes(terrain.feature);
	return (suitsBed ? Suitability.BedSuits : Suitability.BedDoesNot) + (suitsFeature ? Suitability.FeatureSuits : Suitability.FeatureDoesNot);
}
