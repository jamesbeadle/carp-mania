import type { WorldActivity } from '../../contracts/WorldActivity';
import type { WorldEvent } from '../worldTypes';
import type { RegionCode } from './regionCodes';

export interface LakeIdentity {
	name: string;
	region: RegionCode;
}

export type FindLake = (lakeId: string) => LakeIdentity | null;

const APrivateWater = 'a private water';

export function activityFrom(event: WorldEvent, findLake: FindLake): WorldActivity {
	const lake = findLake(event.lake_id);
	const otherLake = event.other_lake_id ? findLake(event.other_lake_id) : null;
	return {
		id: event.id,
		kind: event.kind,
		lakeId: event.lake_id,
		lakeName: lake?.name ?? nameInPayload(event) ?? APrivateWater,
		otherLakeId: event.other_lake_id,
		otherLakeName: otherLake?.name ?? (event.other_lake_id ? APrivateWater : null),
		region: lake?.region ?? null,
		payload: event.payload,
		createdAt: event.created_at
	};
}

function nameInPayload(event: WorldEvent) {
	const lakeName = event.payload.lakeName;
	return typeof lakeName === 'string' ? lakeName : null;
}
