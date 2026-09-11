import { BaitCatalogue, type BaitName } from '../tackle/baits';
import type { TubingColour } from '../tackle/tubing';
import type { Swim } from '../types';
import { WaterScale } from '../waterQuality';

export function tubingMatchScore(tubing: TubingColour, bait: BaitName, swim: Swim, transparency: number) {
	if (tubing === 'yellow') return BaitCatalogue[bait].isYellow ? 1 : 0.55;
	if (tubing === 'black') return 1 - (transparency / WaterScale.Best) * 0.5;
	if (tubing === 'brown') return swim.bed_type === 'silt' || swim.bed_type === 'clay' ? 0.95 : 0.7;
	return swim.feature === 'weed_bed' || swim.feature === 'reed_line' ? 0.95 : 0.65;
}
