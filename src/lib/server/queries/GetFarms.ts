import type { FarmOnShelf, FarmShelves } from '$lib/contracts/FarmShelves';
import { StockingDensity, biomassPerAcre } from '$lib/domain/market/density';
import { farmQuoteFor } from '$lib/domain/market/farmQuote';
import { FarmCatalogue, type Farm } from '$lib/domain/market/farms';
import type { Carp, Lake } from '$lib/domain/types';
import { loadProfile } from '../gates/requireMoney';
import { requireUser } from '../gates/requireUser';
import { GetFarmPacks } from './GetFarmPacks';
import { loadCurrentWater } from './loadMyWaters';

export async function GetFarms(locals: App.Locals, now = new Date()): Promise<FarmShelves> {
	const user = requireUser(locals);
	const [profile, water] = await Promise.all([loadProfile(locals), loadCurrentWater(locals, user.id)]);
	const farms = await Promise.all(FarmCatalogue.map((farm) => shelfFor(farm, water, now)));
	const roomLeftLb = water ? await roomLeftIn(locals, water) : null;
	return { farms, money: Number(profile.money), waterName: water?.name ?? null, roomLeftLb };
}

async function shelfFor(farm: Farm, water: Lake | null, now: Date): Promise<FarmOnShelf> {
	const packs = await GetFarmPacks(farm, now);
	return { farm, packs, quote: water ? farmQuoteFor(farm, water) : null };
}

async function roomLeftIn(locals: App.Locals, water: Lake) {
	const { data: carp } = await locals.supabase.from('carp').select('weight_lb, is_catalogued').eq('lake_id', water.id);
	const stocked = biomassPerAcre((carp ?? []) as Pick<Carp, 'weight_lb' | 'is_catalogued'>[], Number(water.acres));
	const roomPerAcre = StockingDensity.FarmRefusesAboveLbPerAcre - stocked;
	return Math.max(0, Math.round(roomPerAcre * Number(water.acres)));
}
