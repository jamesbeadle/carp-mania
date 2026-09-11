import { FeedCatalogue, FeedTypes } from '$lib/domain/feed';
import { loadProfile, moneyShortfall, spendMoney } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { readFormChoice, readFormNumber } from '../gates/readFormNumber';

const FeedOrder = { MinimumKilograms: 1, MaximumKilograms: 500 } as const;

export async function FeedLake(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const feedType = readFormChoice(formData, 'feedType', FeedTypes);
	if (feedType.failure) return feedType.failure;
	const kilograms = readFormNumber(formData, 'kilograms', FeedOrder.MinimumKilograms, FeedOrder.MaximumKilograms);
	if (kilograms.failure) return kilograms.failure;

	const cost = kilograms.value * FeedCatalogue[feedType.value].pricePerKilogram;
	const profile = await loadProfile(locals);
	const shortfall = moneyShortfall(profile, cost);
	if (shortfall) return shortfall;

	const feed_stock = { ...lake.feed_stock, [feedType.value]: lake.feed_stock[feedType.value] + kilograms.value };
	await locals.supabase.from('lakes').update({ feed_stock }).eq('id', lake.id);
	await spendMoney(locals, profile, cost);
	return { message: `Fed ${kilograms.value} kg of ${FeedCatalogue[feedType.value].label.toLowerCase()}` };
}
