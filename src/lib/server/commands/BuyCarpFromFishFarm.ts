import { fail } from '@sveltejs/kit';
import { StockingDensity, wouldFarmRefuse } from '$lib/domain/market/density';
import { farmFishFor } from '$lib/domain/market/farmDelivery';
import { FarmBands, farmOrderFishCount, farmOrderHeaviestPossibleLb, farmOrderTotalCost, type FarmOrder } from '$lib/domain/market/fishFarm';
import { seededRandom } from '$lib/domain/random';
import type { Carp } from '$lib/domain/types';
import type { RegionCode } from '$lib/domain/world/regionCodes';
import { formatMoney } from '$lib/format/money';
import { loadProfile, moneyShortfall } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { readFormNumber } from '../gates/readFormNumber';
import { GetFishFarmStock } from '../queries/GetFishFarmStock';

const OrderPerBand = { Minimum: 0, Maximum: 200 } as const;

export async function BuyCarpFromFishFarm(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const order = readOrder(formData);
	if (order.failure) return order.failure;
	if (farmOrderFishCount(order.value) === 0) return fail(400, { message: 'Order at least one fish' });

	const profile = await loadProfile(locals);
	const region = profile.home_region ?? lake.region;
	const supplyShortfall = await farmSupplyShortfall(locals, region, order.value);
	if (supplyShortfall) return supplyShortfall;
	const shortfall = moneyShortfall(profile, farmOrderTotalCost(order.value));
	if (shortfall) return shortfall;

	const carp = await loadCarpOf(locals, lake.id);
	const isTooFull = wouldFarmRefuse(carp, lake.acres, farmOrderHeaviestPossibleLb(order.value));
	if (isTooFull) return fail(400, { message: `The farm won't deliver past ${StockingDensity.FarmRefusesAboveLbPerAcre} lb an acre — that order would overfill your water` });

	const fish = farmFishFor(order.value, region, carp.length, seededRandom(Date.now()));
	const { data: deliveredCount, error } = await locals.supabase.rpc('buy_from_fish_farm', { fish });
	if (error) return fail(400, { message: error.message });
	return { message: `Ordered ${deliveredCount} fish from the farm for ${formatMoney(farmOrderTotalCost(order.value))} — they arrive next fishery day` };
}

function readOrder(formData: FormData) {
	const order: FarmOrder = {};
	for (const band of FarmBands) {
		const count = readFormNumber(formData, band.key, OrderPerBand.Minimum, OrderPerBand.Maximum);
		if (count.failure) return { value: null, failure: count.failure };
		order[band.key] = Math.floor(count.value);
	}
	return { value: order, failure: null };
}

async function farmSupplyShortfall(locals: App.Locals, region: RegionCode, order: FarmOrder) {
	const stock = await GetFishFarmStock(locals, region);
	const shortBand = stock.find((band) => (order[band.key] ?? 0) > band.left);
	if (!shortBand) return null;
	return fail(400, { message: `The farm only has ${shortBand.left} of the ${shortBand.label} left this week` });
}

async function loadCarpOf(locals: App.Locals, lakeId: string) {
	const { data: carp } = await locals.supabase.from('carp').select('weight_lb, is_catalogued').eq('lake_id', lakeId);
	return (carp ?? []) as Pick<Carp, 'weight_lb' | 'is_catalogued'>[];
}
