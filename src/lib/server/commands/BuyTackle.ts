import { fail } from '@sveltejs/kit';
import { isTierAtOrBelow, WorldShopStocksUpTo, type Tier } from '$lib/domain/tackle/brands';
import { tackleItem } from '$lib/domain/tackle/catalogue';
import { isPrizeOnly } from '$lib/domain/tackle/catalogue/prizeOnly';
import { isSponsoredBy, tillReceiptFor, type TillReceipt } from '$lib/domain/tackle/sponsorship';
import type { TackleItem } from '$lib/domain/tackle/tackleItem';
import { FisheryClock } from '$lib/domain/simulation/elapsedDays';
import { formatMoney } from '$lib/format/money';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { readFormNumber } from '../gates/readFormNumber';
import { requireUser } from '../gates/requireUser';
import { loadRatingOf } from '../queries/loadAnglerRating';
import { loadBrandCredits, loadSponsorships } from '../queries/loadSponsorships';

const Packs = { Fewest: 1, Most: 20 } as const;
const NoSpoilage = null;

function spoilsAtFor(item: TackleItem, now: Date) {
	if (item.kind !== 'bait' || item.bait.keepsDays === null) return NoSpoilage;
	return new Date(now.getTime() + item.bait.keepsDays * FisheryClock.RealMillisecondsPerFisheryDay).toISOString();
}

export async function BuyTackle(locals: App.Locals, formData: FormData, stocksUpTo: Tier = WorldShopStocksUpTo) {
	const user = requireUser(locals);
	const item = tackleItem(String(formData.get('itemId') ?? ''));
	if (!item || isPrizeOnly(item)) return fail(400, { message: 'That is not something the shop sells' });
	const packs = readFormNumber(formData, 'packs', Packs.Fewest, Packs.Most);
	if (packs.failure) return packs.failure;
	if (!isTierAtOrBelow(item.tier, stocksUpTo)) return fail(400, { message: `${item.label} is only sold at a water whose shop stocks the ${item.tier} tier` });
	const now = new Date();
	const [rating, sponsorships, credits] = await Promise.all([
		loadRatingOf(locals, user.id), loadSponsorships(locals, user.id), loadBrandCredits(locals, user.id)
	]);
	const isSponsored = isSponsoredBy(sponsorships, item.brand, now);
	const isLocked = rating < item.minimumRating && !isSponsored;
	if (isLocked) return fail(400, { message: `${item.label} needs a rating of ${item.minimumRating} — yours is ${Math.round(rating)}` });

	const packCount = Math.floor(packs.value);
	const receipt = tillReceiptFor(item, packCount, sponsorships, credits, now);
	const amount = packCount * item.packQuantity;
	const purchase = { player: user.id, item: item.id, amount, price: receipt.price, spoils: spoilsAtFor(item, now), brand: item.brand };
	const { error } = await trustedSupabase().rpc('buy_tackle_on_credit', purchase);
	if (error) return fail(400, { message: error.message });
	return { message: receiptWords(item.label, receipt) };
}

function receiptWords(label: string, receipt: TillReceipt) {
	const sponsored = receipt.isSponsored ? ' at the sponsor\'s price' : '';
	const credited = receipt.fromCredit > 0 ? `, ${formatMoney(receipt.fromCredit)} of it on brand credit` : '';
	return `Bought ${label} for ${formatMoney(receipt.price)}${sponsored}${credited}`;
}
