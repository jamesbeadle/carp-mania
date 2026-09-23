import { fail } from '@sveltejs/kit';
import { StockingDensity, wouldFarmRefuse } from '$lib/domain/market/density';
import { arrivesAsAShoal, farmFishFor, farmShoalFor } from '$lib/domain/market/farmDelivery';
import { packFishPrice } from '$lib/domain/market/farmPacks';
import { farmDeliveryTermsFor, type FarmDeliveryTerms } from '$lib/domain/market/farmQuote';
import type { PackOnShelf } from '$lib/contracts/FarmShelves';
import { farmById } from '$lib/domain/market/farms';
import { doesFarmSellTo, farmStandingWords } from '$lib/domain/market/farmStanding';
import { waterRatingOfLake } from '$lib/domain/water/waterRating';
import { seededRandom } from '$lib/domain/random';
import type { Shoal } from '$lib/domain/stock/shoals';
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
	const waterRating = waterRatingOfLake(lake);
	const isSellingToYou = doesFarmSellTo(farm.grade, waterRating);
	if (!isSellingToYou) return fail(400, { message: farmStandingWords(farm, waterRating) });
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
	const shoals = await loadShoalsOf(locals, lake.id);
	const isTooFull = wouldFarmRefuse(carp, Number(lake.acres), wanted * pack.band.toLb, shoals);
	if (isTooFull) return fail(400, { message: `The farm won't deliver past ${StockingDensity.FarmRefusesAboveLbPerAcre} lb an acre — that pack would overfill your water` });

	const random = seededRandom(now.getTime());
	const error = arrivesAsAShoal(pack, wanted)
		? await orderTheShoal(lake.owner_id, lake.id, pack, wanted, fishPrice, terms)
		: await orderNamedFish(lake.owner_id, pack, farmFishFor(pack, wanted, farm.region, carp.length, random), fishPrice, terms);
	if (error) return fail(400, { message: error });
	const { cost, transitDays } = terms.quote;
	return { message: `${wanted} fish ordered from ${farm.name} for ${formatMoney(fishPrice + cost)} — ${transitDays} days on the lorry` };
}

function deliveryArguments(player: string, pack: string, fishPrice: number, terms: FarmDeliveryTerms) {
	return {
		player,
		pack,
		fish_price: fishPrice,
		transport: terms.quote.cost,
		arrives: terms.arrivesAt.toISOString(),
		quarantined_until: terms.quarantineUntil?.toISOString() ?? null,
		kilometres: terms.quote.distanceKilometres
	};
}

async function orderNamedFish(player: string, pack: PackOnShelf, fish: unknown[], fishPrice: number, terms: FarmDeliveryTerms) {
	const { error } = await trustedSupabase().rpc('buy_farm_pack', { ...deliveryArguments(player, pack.id, fishPrice, terms), fish });
	return error?.message ?? null;
}

async function orderTheShoal(player: string, lakeId: string, pack: PackOnShelf, count: number, fishPrice: number, terms: FarmDeliveryTerms) {
	const shoal = farmShoalFor(pack, count, lakeId);
	const { error } = await trustedSupabase().rpc('buy_farm_shoal', { ...deliveryArguments(player, pack.id, fishPrice, terms), shoal });
	return error?.message ?? null;
}

async function loadCarpOf(locals: App.Locals, lakeId: string) {
	const { data: carp } = await locals.supabase.from('carp').select('weight_lb, is_catalogued').eq('lake_id', lakeId);
	return (carp ?? []) as Pick<Carp, 'weight_lb' | 'is_catalogued'>[];
}

async function loadShoalsOf(locals: App.Locals, lakeId: string) {
	const { data: shoals } = await locals.supabase.from('carp_shoals').select('count, average_weight_lb').eq('lake_id', lakeId);
	return (shoals ?? []) as Pick<Shoal, 'count' | 'average_weight_lb'>[];
}
