import { fail } from '@sveltejs/kit';
import { formatMoney } from '$lib/format/money';
import { readFormNumber } from '../gates/readFormNumber';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const Fields = { Shoal: 'shoalId', Count: 'count' } as const;
const HeadCount = { Fewest: 1, Most: 10000 } as const;

export async function SellShoalFish(locals: App.Locals, formData: FormData) {
	await requireOwnedLake(locals);
	const shoalId = String(formData.get(Fields.Shoal) ?? '');
	const count = readFormNumber(formData, Fields.Count, HeadCount.Fewest, HeadCount.Most);
	if (count.failure) return count.failure;
	const headCount = Math.floor(count.value);
	const { data: paid, error } = await locals.supabase.rpc('sell_shoal_fish', { shoal: shoalId, head_count: headCount });
	if (error) return fail(400, { message: error.message });
	return { message: `The dealer took ${headCount} fish from the shoal for ${formatMoney(Number(paid))}` };
}
