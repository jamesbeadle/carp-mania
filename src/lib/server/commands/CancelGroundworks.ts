import { fail } from '@sveltejs/kit';
import { isInProgress, refundFor } from '$lib/domain/groundworks/worksLedger';
import type { LakeWork } from '$lib/domain/worldTypes';
import { formatMoney } from '$lib/format/money';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { creditMoney } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';

export async function CancelGroundworks(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const workId = String(formData.get('workId') ?? '');
	const work = await loadWorkInLake(locals, workId, lake.id);
	if (!work || !isInProgress(work)) return fail(400, { message: 'That work is not in progress' });

	const refund = refundFor(work, new Date(lake.simulated_until));
	const trusted = trustedSupabase();
	await trusted.from('lake_works').update({ status: 'cancelled' }).eq('id', work.id);
	if (refund > 0) await creditMoney(lake.owner_id, refund);
	return { message: refund > 0 ? `Works cancelled — ${formatMoney(refund)} refunded` : 'Works cancelled — the diggers had already started, so nothing comes back' };
}

async function loadWorkInLake(locals: App.Locals, workId: string, lakeId: string): Promise<LakeWork | null> {
	if (workId === '') return null;
	const { data: work } = await locals.supabase.from('lake_works').select('*').eq('id', workId).eq('lake_id', lakeId).maybeSingle();
	return work as LakeWork | null;
}

