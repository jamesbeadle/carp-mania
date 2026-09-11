import type { RegionGuide } from '$lib/contracts/RegionGuide';
import { RegionCatalogue } from '$lib/domain/world/regions';
import type { RegionCode } from '$lib/domain/world/regionCodes';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { requireUser } from '../gates/requireUser';

export async function GetRegionGuide(locals: App.Locals, region: RegionCode): Promise<RegionGuide> {
	requireUser(locals);
	const [openLakes, biggestCarpLb] = await Promise.all([loadOpenLakesIn(region), loadBiggestCataloguedCarpIn(region)]);
	const fees = openLakes.map((lake) => Number(lake.day_ticket_fee));
	const averageDayTicket = fees.length === 0 ? 0 : fees.reduce((total, fee) => total + fee, 0) / fees.length;
	return { ...RegionCatalogue[region], region, lakeCount: openLakes.length, biggestCarpLb, averageDayTicket };
}

async function loadOpenLakesIn(region: RegionCode) {
	const { data: lakes } = await trustedSupabase()
		.from('lakes')
		.select('day_ticket_fee')
		.eq('region', region)
		.eq('is_public', true)
		.eq('is_setup_complete', true);
	return (lakes ?? []) as { day_ticket_fee: number }[];
}

async function loadBiggestCataloguedCarpIn(region: RegionCode) {
	const { data: heaviest } = await trustedSupabase()
		.from('carp')
		.select('weight_lb, lakes!carp_lake_id_fkey!inner(region)')
		.eq('lakes.region', region)
		.eq('is_catalogued', true)
		.order('weight_lb', { ascending: false })
		.limit(1)
		.maybeSingle();
	const row = heaviest as { weight_lb: number } | null;
	return row ? Number(row.weight_lb) : 0;
}
