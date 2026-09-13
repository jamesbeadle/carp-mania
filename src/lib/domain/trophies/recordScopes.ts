import type { RecordScope } from '../../contracts/TrophyRoom';
import { isRegionCode } from '../world/regionCodes';
import { RegionCatalogue } from '../world/regions';

export const RecordScopeWords: Record<RecordScope, string> = { lake: 'Lake record', region: 'Region record', world: 'World record' };

export function recordScopeNameFor(scope: RecordScope, scopeName: string) {
	if (scope === 'region' && isRegionCode(scopeName)) return RegionCatalogue[scopeName].label;
	return scopeName;
}

export function isRecordScope(value: string): value is RecordScope {
	return value === 'lake' || value === 'region' || value === 'world';
}
