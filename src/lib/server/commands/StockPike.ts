import { fail } from '@sveltejs/kit';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { PikeRules, Prices } from '$lib/domain/economy';
import { PikeFoodOrder, roomForMorePike, whyNoRoomForPike } from '$lib/domain/pikeStocking';
import { loadProfile, moneyShortfall, spendMoney } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { readFormNumber } from '../gates/readFormNumber';

const FewestPikePerOrder = 1;

export async function StockPike(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const noRoom = whyNoRoomForPike(lake);
	if (noRoom) return fail(400, { message: noRoom });
	const count = readFormNumber(formData, 'count', FewestPikePerOrder, roomForMorePike(lake));
	if (count.failure) return count.failure;

	const pikeCount = Math.floor(count.value);
	const cost = pikeCount * Prices.Pike;
	const profile = await loadProfile(locals);
	const shortfall = moneyShortfall(profile, cost);
	if (shortfall) return shortfall;

	await trustedSupabase().from('lakes').update({ pike_count: lake.pike_count + pikeCount }).eq('id', lake.id);
	await spendMoney(profile, cost);
	return { message: `Introduced ${pikeCount} pike (they top out around ${PikeRules.MaximumWeightLb} lb)` };
}

export async function StockPikeFood(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const units = readFormNumber(formData, 'units', PikeFoodOrder.MinimumUnits, PikeFoodOrder.MaximumUnits);
	if (units.failure) return units.failure;

	const cost = units.value * Prices.PikeFoodPerUnit;
	const profile = await loadProfile(locals);
	const shortfall = moneyShortfall(profile, cost);
	if (shortfall) return shortfall;

	await trustedSupabase().from('lakes').update({ pike_food: Number(lake.pike_food) + units.value }).eq('id', lake.id);
	await spendMoney(profile, cost);
	return { message: `Added ${units.value} units of perch, rudd and roach for the pike` };
}
