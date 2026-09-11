import { CarpWeight } from '$lib/domain/carpGrowth';
import { priceOfCarp } from '$lib/domain/economy';
import { carpNameForIndex } from '$lib/domain/naming/carpNames';
import { randomBetween, seededRandom } from '$lib/domain/random';
import { pickStrain } from '$lib/domain/strains';
import { loadProfile, moneyShortfall, spendMoney } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { readFormNumber } from '../gates/readFormNumber';

const StockOrder = { MinimumCount: 1, MaximumCount: 50, MinimumWeightLb: 5, MaximumWeightLb: 45 } as const;

export async function StockCarp(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const count = readFormNumber(formData, 'count', StockOrder.MinimumCount, StockOrder.MaximumCount);
	if (count.failure) return count.failure;
	const weight = readFormNumber(formData, 'weightLb', StockOrder.MinimumWeightLb, StockOrder.MaximumWeightLb);
	if (weight.failure) return weight.failure;

	const cost = priceOfCarp(weight.value) * count.value;
	const profile = await loadProfile(locals);
	const shortfall = moneyShortfall(profile, cost);
	if (shortfall) return shortfall;

	const { count: existingCount } = await locals.supabase.from('carp').select('id', { count: 'exact', head: true }).eq('lake_id', lake.id);
	const random = seededRandom(Date.now());
	const newCarp = Array.from({ length: count.value }, (_, index) => ({
		lake_id: lake.id,
		name: carpNameForIndex((existingCount ?? 0) + index),
		strain: pickStrain(random()),
		weight_lb: Math.min(CarpWeight.HeaviestPossibleLb, Math.round(randomBetween(random, weight.value - 1, weight.value + 1) * 4) / 4),
		age_years: Math.round(2 + weight.value / 4),
		condition: Math.round(randomBetween(random, 70, 90)),
		times_caught: 0
	}));
	await locals.supabase.from('carp').insert(newCarp);
	await spendMoney(locals, profile, cost);
	return { message: `Stocked ${count.value} carp around ${weight.value} lb for £${cost}` };
}
