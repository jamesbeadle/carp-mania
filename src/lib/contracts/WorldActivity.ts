import type { RegionCode } from '$lib/domain/world/regionCodes';
import type { WorldEventKind } from '$lib/domain/worldTypes';

export interface WorldActivity {
	id: string;
	kind: WorldEventKind;
	lakeId: string;
	lakeName: string;
	otherLakeId: string | null;
	otherLakeName: string | null;
	region: RegionCode | null;
	payload: Record<string, unknown>;
	createdAt: string;
}
