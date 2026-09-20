import { fail } from '@sveltejs/kit';
import { isSpecies, SpeciesCatalogue, SpeciesNames } from '$lib/domain/water/species';
import { formatMoney } from '$lib/format/money';
import { readFormChoice, readFormNumber } from '../gates/readFormNumber';
import { loadProfile, moneyShortfall } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const Fields = { Species: 'species', Count: 'count' } as const;
const HeadCount = { Fewest: 1, Most: 5000 } as const;

export async function StockCoarseFish(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const species = readFormChoice(formData, Fields.Species, SpeciesNames);
	if (species.failure || !isSpecies(species.value)) return species.failure ?? fail(400, { message: 'No such fish' });
	const count = readFormNumber(formData, Fields.Count, HeadCount.Fewest, HeadCount.Most);
	if (count.failure) return count.failure;
	const headCount = Math.floor(count.value);
	const price = headCount * SpeciesCatalogue[species.value].pricePerFish;
	const shortfall = moneyShortfall(await loadProfile(locals), price);
	if (shortfall) return shortfall;
	const stocking = { lake: lake.id, kind: species.value, head_count: headCount, price };
	const { error } = await locals.supabase.rpc('stock_coarse_fish', stocking);
	if (error) return fail(400, { message: error.message });
	return { message: `${headCount} ${SpeciesCatalogue[species.value].label.toLowerCase()} stocked for ${formatMoney(price)}` };
}
