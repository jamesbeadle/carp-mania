import { isOnLand } from './landCheck';
import type { RegionCode } from './regionCodes';
import { isInsideRegion, RegionCatalogue } from './regions';

const InTheSea = 'That spot is in the sea';

export function whyPlotIsRefused(region: RegionCode, latitude: number, longitude: number): string | null {
	if (!isInsideRegion(region, latitude, longitude)) return `That spot is outside ${RegionCatalogue[region].label}`;
	if (!isOnLand(latitude, longitude)) return InTheSea;
	return null;
}
