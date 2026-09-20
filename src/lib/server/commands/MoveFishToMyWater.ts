import { fail } from '@sveltejs/kit';
import { whyCannotMoveTo, whyFishCannotMove } from '$lib/domain/market/estateMove';
import { waterOnGlobeOf } from '$lib/domain/market/farmQuote';
import { arrivalTimes, transportQuote } from '$lib/domain/market/transport';
import { formatMoney } from '$lib/format/money';
import { loadChosenFishInLake, readChosenFishIds, whyChosenFishAreMissing } from '../gates/readChosenFish';
import { loadProfile, moneyShortfall } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { loadMyWaters } from '../queries/loadMyWaters';

const DestinationField = 'destinationId';
const OpenStatus = 'open';

export async function MoveFishToMyWater(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const waters = await loadMyWaters(locals, lake.owner_id);
	const destinationId = String(formData.get(DestinationField) ?? '');
	const wrongWater = whyCannotMoveTo(waters, lake.id, destinationId);
	if (wrongWater) return fail(400, { message: wrongWater });
	const chosen = readChosenFishIds(formData);
	if (chosen.failure) return chosen.failure;
	const fish = await loadChosenFishInLake(locals, chosen.value, lake.id);
	const missing = whyChosenFishAreMissing(chosen.value, fish);
	if (missing) return fail(400, { message: missing });
	const listed = await loadOpenListingIds(locals, chosen.value);
	const refusal = fish.map((one) => whyFishCannotMove(one, destinationId, listed)).find((reason) => reason !== null);
	if (refusal) return fail(400, { message: refusal });

	const destination = waters.find((water) => water.id === destinationId)!;
	const quote = transportQuote(waterOnGlobeOf(lake), waterOnGlobeOf(destination));
	const shortfall = moneyShortfall(await loadProfile(locals), quote.cost);
	if (shortfall) return shortfall;
	const times = arrivalTimes(new Date(), quote);
	const { data: moved, error } = await locals.supabase.rpc('move_to_my_water', {
		fish: fish.map((one) => one.id),
		destination: destinationId,
		transport: quote.cost,
		arrives: times.arrivesAt.toISOString(),
		quarantined_until: times.quarantineUntil?.toISOString() ?? null,
		kilometres: quote.distanceKilometres
	});
	if (error) return fail(400, { message: error.message });
	return { message: `${moved} fish on the lorry to ${destination.name} for ${formatMoney(quote.cost)} — ${quote.transitDays} days in transit` };
}

async function loadOpenListingIds(locals: App.Locals, carpIds: string[]) {
	const { data: listings } = await locals.supabase.from('listings').select('carp_id').in('carp_id', carpIds).eq('status', OpenStatus);
	return new Set(((listings ?? []) as { carp_id: string }[]).map((listing) => listing.carp_id));
}
