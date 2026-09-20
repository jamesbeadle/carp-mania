import { fail } from '@sveltejs/kit';
import { formatMoney } from '$lib/format/money';
import { readFormNumber } from '../gates/readFormNumber';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const Places = { Fewest: 0, Most: 500 } as const;
const Price = { Lowest: 0, Highest: 50000 } as const;

export async function SellSyndicatePlaces(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const places = readFormNumber(formData, 'places', Places.Fewest, Places.Most);
	if (places.failure) return places.failure;
	const price = readFormNumber(formData, 'price', Price.Lowest, Price.Highest);
	if (price.failure) return price.failure;
	const placeCount = Math.floor(places.value);
	const sale = { lake: lake.id, places: placeCount, price: Math.round(price.value) };
	const { error } = await locals.supabase.rpc('sell_syndicate_places', sale);
	if (error) return fail(400, { message: error.message });
	if (price.value === 0) return { message: 'The syndicate is closed; day tickets are back on the book' };
	return { message: `${placeCount} syndicate places on sale at ${formatMoney(price.value)} a year — no day tickets while it runs` };
}
