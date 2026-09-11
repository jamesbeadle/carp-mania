import type { WorldEvent, WorldEventKind } from '../worldTypes';

export type NewWorldEvent = Omit<WorldEvent, 'id' | 'created_at'>;

export const BigCatch = { ByPlayerFromLb: 30, ByNpcFromLb: 40 } as const;

export function bigCatchEvent(lakeId: string, fishName: string, weightLb: number, anglerName: string): NewWorldEvent {
	return event('big_catch', lakeId, { fishName, weightLb, anglerName });
}

export function recordEvent(lakeId: string, fishName: string, weightLb: number, scope: 'lake' | 'region' | 'world'): NewWorldEvent {
	return event('record', lakeId, { fishName, weightLb, scope });
}

export function saleEvent(sellerLakeId: string, buyerLakeId: string, fishName: string, price: number): NewWorldEvent {
	return { kind: 'sale', lake_id: sellerLakeId, other_lake_id: buyerLakeId, payload: { fishName, price } };
}

export function newWaterEvent(lakeId: string, lakeName: string, region: string): NewWorldEvent {
	return event('new_water', lakeId, { lakeName, region });
}

export function islandBuiltEvent(lakeId: string, lakeName: string, islandName: string): NewWorldEvent {
	return event('island_built', lakeId, { lakeName, islandName });
}

export function isBigNpcCatch(weightLb: number) {
	return weightLb >= BigCatch.ByNpcFromLb;
}

function event(kind: WorldEventKind, lakeId: string, payload: Record<string, unknown>): NewWorldEvent {
	return { kind, lake_id: lakeId, other_lake_id: null, payload };
}
