import type { FarmBandStock } from '$lib/contracts/FishFarmStock';
import { FarmBands, fisheryWeekStart, type FarmBandKey } from '$lib/domain/market/fishFarm';
import type { TransferKind } from '$lib/domain/marketTypes';
import type { RegionCode } from '$lib/domain/world/regionCodes';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { requireUser } from '../gates/requireUser';

const FarmDeliveryKind: TransferKind = 'farm_delivery';

type SoldPerBand = Partial<Record<FarmBandKey, number>>;

export async function GetFishFarmStock(locals: App.Locals, region: RegionCode): Promise<FarmBandStock[]> {
	requireUser(locals);
	const soldThisWeek = await countDeliveredThisWeek(region, new Date());
	return FarmBands.map((band) => {
		const sold = soldThisWeek[band.key] ?? 0;
		return { ...band, sold, left: Math.max(0, band.weeklySupply - sold) };
	});
}

async function countDeliveredThisWeek(region: RegionCode, now: Date): Promise<SoldPerBand> {
	const { data: deliveries } = await trustedSupabase()
		.from('carp_transfers')
		.select('farm_band, lakes!carp_transfers_to_lake_id_fkey!inner(region)')
		.eq('kind', FarmDeliveryKind)
		.eq('lakes.region', region)
		.gte('departed_at', fisheryWeekStart(now).toISOString());
	const sold: SoldPerBand = {};
	for (const delivery of (deliveries ?? []) as { farm_band: FarmBandKey }[]) sold[delivery.farm_band] = (sold[delivery.farm_band] ?? 0) + 1;
	return sold;
}
