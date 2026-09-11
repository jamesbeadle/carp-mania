import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { PikeRules, Prices } from '$lib/domain/economy';
import { loadProfile, moneyShortfall, spendMoney } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { readFormNumber } from '../gates/readFormNumber';

export async function StockPike(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const sensibleMaximum = Math.ceil((lake.acres / 10) * PikeRules.MaximumSensiblePerTenAcres);
	const count = readFormNumber(formData, 'count', 1, sensibleMaximum);
	if (count.failure) return count.failure;

	const cost = count.value * Prices.Pike;
	const profile = await loadProfile(locals);
	const shortfall = moneyShortfall(profile, cost);
	if (shortfall) return shortfall;

	await trustedSupabase().from('lakes').update({ pike_count: lake.pike_count + count.value }).eq('id', lake.id);
	await spendMoney(profile, cost);
	return { message: `Introduced ${count.value} pike (they top out around ${PikeRules.MaximumWeightLb} lb)` };
}

export async function StockPikeFood(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const units = readFormNumber(formData, 'units', 1, 200);
	if (units.failure) return units.failure;

	const cost = units.value * Prices.PikeFoodPerUnit;
	const profile = await loadProfile(locals);
	const shortfall = moneyShortfall(profile, cost);
	if (shortfall) return shortfall;

	await trustedSupabase().from('lakes').update({ pike_food: Number(lake.pike_food) + units.value }).eq('id', lake.id);
	await spendMoney(profile, cost);
	return { message: `Added ${units.value} units of perch, rudd and roach for the pike` };
}
