import { fail } from '@sveltejs/kit';
import { StockingDensity, wouldFarmRefuse } from '$lib/domain/market/density';
import { farmFishFor } from '$lib/domain/market/farmDelivery';
import { packFishPrice } from '$lib/domain/market/farmPacks';
import { farmDeliveryTermsFor } from '$lib/domain/market/farmQuote';
import { farmById } from '$lib/domain/market/farms';
import { seededRandom } from '$lib/domain/random';
import type { Carp } from '$lib/domain/types';
import { formatMoney } from '$lib/format/money';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { readFormNumber } from '../gates/readFormNumber';
import { loadProfile, moneyShortfall } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { packOnShelf } from '../queries/GetFarmPacks';

const Fields = { Farm: 'farmId', Pack: 'packId', Count: 'count' } as const;
const OrderCount = { Fewest: 1, Most: 200 } as const;

export async function BuyFarmPack(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const farm = farmById(String(formData.get(Fields.Farm) ?? ''));
	if (!farm) return fail(400, { message: 'No farm of that name' });
	const count = readFormNumber(formData, Fields.Count, OrderCount.Fewest, OrderCount.Most);
	if (count.failure) return count.failure;
	const now = new Date();
	const pack = await packOnShelf(farm, String(formData.get(Fields.Pack) ?? ''), now);
	if (!pack) return fail(400, { message: `${farm.name} has no such pack this week` });
	const wanted = Math.floor(count.value);
	if (wanted > pack.left) return fail(400, { message: `${farm.name} only has ${pack.left} of that pack left this week` });

	const terms = farmDeliveryTermsFor(farm, lake, now);
	const fishPrice = packFishPrice(pack, wanted);
	const shortfall = moneyShortfall(await loadProfile(locals), fishPrice + terms.quote.cost);
	if (shortfall) return shortfall;
	const carp = await loadCarpOf(locals, lake.id);
	const isTooFull = wouldFarmRefuse(carp, Number(lake.acres), wanted * pack.band.toLb);
	if (isTooFull) return fail(400, { message: `The farm won't deliver past ${StockingDensity.FarmRefusesAboveLbPerAcre} lb an acre — that pack would overfill your water` });

	const fish = farmFishFor(pack, wanted, farm.region, carp.length, seededRandom(now.getTime()));
	const { error } = await trustedSupabase().rpc('buy_farm_pack', orderArguments(lake.owner_id, pack.id, fish, fishPrice, terms));
	if (error) return fail(400, { message: error.message });
	const { cost, transitDays } = terms.quote;
	return { message: `${wanted} fish ordered from ${farm.name} for ${formatMoney(fishPrice + cost)} — ${transitDays} days on the lorry` };
}

function orderArguments(player: string, pack: string, fish: unknown[], fishPrice: number, terms: ReturnType<typeof farmDeliveryTermsFor>) {
	return {
		player,
		pack,
		fish,
		fish_price: fishPrice,
		transport: terms.quote.cost,
		arrives: terms.arrivesAt.toISOString(),
		quarantined_until: terms.quarantineUntil?.toISOString() ?? null,
		kilometres: terms.quote.distanceKilometres
	};
}

async function loadCarpOf(locals: App.Locals, lakeId: string) {
	const { data: carp } = await locals.supabase.from('carp').select('weight_lb, is_catalogued').eq('lake_id', lakeId);
	return (carp ?? []) as Pick<Carp, 'weight_lb' | 'is_catalogued'>[];
}
