import { waterRatingFor } from '../tackle/shopTier';
import type { Lake } from '../types';
import { overallWaterQuality } from '../waterQuality';

export type WaterAsRated = Pick<Lake, 'reputation' | 'transparency' | 'weed' | 'silt'>;

export function waterRatingOfLake(lake: WaterAsRated) {
	const quality = overallWaterQuality(Number(lake.transparency), Number(lake.weed), Number(lake.silt));
	return waterRatingFor(Number(lake.reputation), quality);
}
