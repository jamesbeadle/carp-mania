import { RigCatalogue, type RigName } from '../tackle/rigs';
import type { Swim } from '../types';

export function rigMatchScore(rig: RigName, swim: Swim) {
	const profile = RigCatalogue[rig];
	const suitsBed = profile.suitsBed.includes(swim.bed_type);
	const suitsFeature = profile.suitsFeature.includes(swim.feature);
	const suitability = (suitsBed ? 0.6 : 0.2) + (suitsFeature ? 0.4 : 0.1);
	return suitability * profile.presentationScore;
}
