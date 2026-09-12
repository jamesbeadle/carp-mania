import type { Terrain } from '../layout/terrainAt';
import { BaitCatalogue, type BaitName } from '../tackle/baits';
import type { TubingColour } from '../tackle/tubing';
import { WaterScale } from '../waterQuality';

export function tubingMatchScore(tubing: TubingColour, bait: BaitName, terrain: Terrain, transparency: number) {
	if (tubing === 'yellow') return BaitCatalogue[bait].isYellow ? 1 : 0.55;
	if (tubing === 'black') return 1 - (transparency / WaterScale.Best) * 0.5;
	if (tubing === 'brown') return terrain.bed === 'silt' || terrain.bed === 'clay' ? 0.95 : 0.7;
	return isWeedy(terrain) ? 0.95 : 0.65;
}

function isWeedy(terrain: Terrain) {
	return terrain.feature === 'weed_bed' || terrain.feature === 'reed_line' || terrain.feature === 'lily_pads';
}
