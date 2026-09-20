import { fail } from '@sveltejs/kit';
import { whyDealerRefuses } from '$lib/domain/market/dealer';
import { formatMoney } from '$lib/format/money';
import { loadChosenFishInLake, readChosenFishIds, whyChosenFishAreMissing } from '../gates/readChosenFish';
import { requireOwnedLake } from '../gates/requireOwnedLake';

export async function SellFishToDealer(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const chosen = readChosenFishIds(formData);
	if (chosen.failure) return chosen.failure;
	const fish = await loadChosenFishInLake(locals, chosen.value, lake.id);
	const missing = whyChosenFishAreMissing(chosen.value, fish);
	if (missing) return fail(400, { message: missing });
	const refusal = fish.map(whyDealerRefuses).find((reason) => reason !== null);
	if (refusal) return fail(400, { message: refusal });

	const ids = fish.map((one) => one.id);
	const { data: paid, error } = await locals.supabase.rpc('sell_fish_to_dealer', { fish: ids });
	if (error) return fail(400, { message: error.message });
	return { message: soldWords(fish.length, fish[0].name, Number(paid)) };
}

function soldWords(count: number, firstName: string, paid: number) {
	if (count === 1) return `The dealer took ${firstName} for ${formatMoney(paid)}`;
	return `The dealer took ${count} fish for ${formatMoney(paid)}`;
}
