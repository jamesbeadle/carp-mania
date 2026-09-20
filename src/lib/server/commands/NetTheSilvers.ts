import { fail } from '@sveltejs/kit';
import { Netting, nettingQuoteFor } from '$lib/domain/water/species';
import { formatMoney } from '$lib/format/money';
import { loadProfile, moneyShortfall } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';

export async function NetTheSilvers(locals: App.Locals) {
	const lake = await requireOwnedLake(locals);
	const quote = nettingQuoteFor(Number(lake.acres));
	const shortfall = moneyShortfall(await loadProfile(locals), quote.cost);
	if (shortfall) return shortfall;
	const { cost, disturbance } = quote;
	const netting = { lake: lake.id, price: cost, taken_share: Netting.TakenShare, disturbance_added: disturbance };
	const { data: taken, error } = await locals.supabase.rpc('net_the_silvers', netting);
	if (error) return fail(400, { message: error.message });
	return { message: `The netting crew took ${taken} fish out for ${formatMoney(quote.cost)} — the water is stirred up for a few days` };
}
