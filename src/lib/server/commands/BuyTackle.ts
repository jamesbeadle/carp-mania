import { fail } from '@sveltejs/kit';
import { isTierAtOrBelow, WorldShopStocksUpTo } from '$lib/domain/tackle/brands';
import { tackleItem } from '$lib/domain/tackle/catalogue';
import type { TackleItem } from '$lib/domain/tackle/tackleItem';
import { FisheryClock } from '$lib/domain/simulation/elapsedDays';
import { formatMoney } from '$lib/format/money';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { readFormNumber } from '../gates/readFormNumber';
import { requireUser } from '../gates/requireUser';
import { loadRatingOf } from '../queries/loadAnglerRating';

const Packs = { Fewest: 1, Most: 20 } as const;
const NoSpoilage = null;

function spoilsAtFor(item: TackleItem, now: Date) {
	if (item.kind !== 'bait' || item.bait.keepsDays === null) return NoSpoilage;
	return new Date(now.getTime() + item.bait.keepsDays * FisheryClock.RealMillisecondsPerFisheryDay).toISOString();
}

export async function BuyTackle(locals: App.Locals, formData: FormData) {
	const user = requireUser(locals);
	const item = tackleItem(String(formData.get('itemId') ?? ''));
	if (!item) return fail(400, { message: 'That is not something the shop sells' });
	const packs = readFormNumber(formData, 'packs', Packs.Fewest, Packs.Most);
	if (packs.failure) return packs.failure;
	if (!isTierAtOrBelow(item.tier, WorldShopStocksUpTo)) return fail(400, { message: `${item.label} is only sold at a water whose shop stocks the ${item.tier} tier` });
	const rating = await loadRatingOf(locals, user.id);
	const isLocked = rating < item.minimumRating;
	if (isLocked) return fail(400, { message: `${item.label} needs a rating of ${item.minimumRating} — yours is ${Math.round(rating)}` });

	const quantity = Math.floor(packs.value) * item.packQuantity;
	const price = Math.floor(packs.value) * item.price;
	const spoils = spoilsAtFor(item, new Date());
	const { error } = await trustedSupabase().rpc('buy_tackle', { player: user.id, item: item.id, amount: quantity, price, spoils });
	if (error) return fail(400, { message: error.message });
	return { message: `Bought ${item.label} for ${formatMoney(price)}` };
}
