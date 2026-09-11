import { fail } from '@sveltejs/kit';
import { whyDealerRefuses } from '$lib/domain/market/dealer';
import type { Carp } from '$lib/domain/types';
import { formatMoney } from '$lib/format/money';
import { requireOwnedLake } from '../gates/requireOwnedLake';

export async function SellCarpToDealer(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const carpId = String(formData.get('carpId') ?? '');
	const carp = await loadCarpInLake(locals, carpId, lake.id);
	if (!carp) return fail(400, { message: 'That fish is not in your water' });
	const refusal = whyDealerRefuses(carp);
	if (refusal) return fail(400, { message: refusal });

	const { data: price, error } = await locals.supabase.rpc('sell_to_dealer', { fish: carp.id });
	if (error) return fail(400, { message: error.message });
	return { message: `The dealer took ${carp.name} for ${formatMoney(price)}` };
}

async function loadCarpInLake(locals: App.Locals, carpId: string, lakeId: string): Promise<Carp | null> {
	if (carpId === '') return null;
	const { data: carp } = await locals.supabase.from('carp').select('*').eq('id', carpId).eq('lake_id', lakeId).maybeSingle();
	return carp as Carp | null;
}
