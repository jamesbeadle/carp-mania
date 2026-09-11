import type { Terrain } from '../layout/terrainAt';
import { RigCatalogue, type RigName } from '../tackle/rigs';
import type { BedType } from '../types';

const RockFishesLike: BedType = 'gravel';

export function rigMatchScore(rig: RigName, terrain: Terrain) {
	const profile = RigCatalogue[rig];
	const bed = terrain.bed === 'rock' ? RockFishesLike : terrain.bed;
	const suitsBed = profile.suitsBed.includes(bed);
	const suitsFeature = profile.suitsFeature.includes(terrain.feature);
	const suitability = (suitsBed ? 0.6 : 0.2) + (suitsFeature ? 0.4 : 0.1);
	return suitability * profile.presentationScore;
}
