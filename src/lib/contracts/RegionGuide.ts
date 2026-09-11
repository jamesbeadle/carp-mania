import type { RegionProfile } from '$lib/domain/world/regions';
import type { RegionCode } from '$lib/domain/world/regionCodes';

export interface RegionGuide extends RegionProfile {
	region: RegionCode;
	lakeCount: number;
	biggestCarpLb: number;
	averageDayTicket: number;
}
