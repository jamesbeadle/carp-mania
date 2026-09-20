import type { PackOnShelf } from '$lib/contracts/FarmShelves';
import { packsFor, type FarmPack } from '$lib/domain/market/farmPacks';
import type { Farm } from '$lib/domain/market/farms';
import type { TransferKind } from '$lib/domain/marketTypes';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';

const FarmDeliveryKind: TransferKind = 'farm_delivery';

export async function GetFarmPacks(farm: Farm, now: Date): Promise<PackOnShelf[]> {
	const packs = packsFor(farm, now);
	const sold = await countSoldFrom(packs);
	return packs.map((pack) => onShelf(pack, sold[pack.id] ?? 0));
}

function onShelf(pack: FarmPack, soldCount: number): PackOnShelf {
	return { ...pack, left: Math.max(0, pack.count - soldCount) };
}

export async function packOnShelf(farm: Farm, packId: string, now: Date): Promise<PackOnShelf | null> {
	const packs = await GetFarmPacks(farm, now);
	return packs.find((pack) => pack.id === packId) ?? null;
}

async function countSoldFrom(packs: FarmPack[]): Promise<Record<string, number>> {
	const { data: deliveries } = await trustedSupabase()
		.from('carp_transfers')
		.select('farm_pack_id')
		.eq('kind', FarmDeliveryKind)
		.in('farm_pack_id', packs.map((pack) => pack.id));
	const sold: Record<string, number> = {};
	for (const delivery of (deliveries ?? []) as { farm_pack_id: string }[]) sold[delivery.farm_pack_id] = (sold[delivery.farm_pack_id] ?? 0) + 1;
	return sold;
}
