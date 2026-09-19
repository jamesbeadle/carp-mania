import type { SupabaseClient } from '@supabase/supabase-js';
import type { NewBounty } from '$lib/domain/bounties/bountyDraw';
import { PrizeItemIds, PrizeQuantities } from '$lib/domain/tackle/catalogue/prizeOnly';
import type { DayOutcome } from '$lib/domain/simulation/dayTypes';

const NoItem = { itemId: null, quantity: 0 };
const NoSponsor = null;

export async function persistBounties(trusted: SupabaseClient, lakeId: string, outcomes: DayOutcome[]) {
	const drawn = outcomes.flatMap((day) => (day.bountyDrawn ? [day.bountyDrawn] : []));
	for (const bounty of drawn) await trusted.rpc('open_bounty', openingOf(lakeId, bounty));
}

function openingOf(lakeId: string, bounty: NewBounty) {
	const { prize, kind, band, swimId, swimName, targetCarpId, targetCarpName, targetWeightLb, sponsorBrand, opensAt, endsAt } = bounty;
	const item = prizeItemOf(prize.kind);
	return {
		lake: lakeId, swim: swimId, swim_label: swimName, kind, band,
		target_carp: targetCarpId, target_name: targetCarpName, target_lb: targetWeightLb,
		sponsor: sponsorBrand, posted_by: NoSponsor, prize_kind: prize.kind, prize_money: prize.money, prize_brand: prize.brand,
		prize_item: item.itemId, prize_quantity: item.quantity, prize_design: prize.designId,
		opens: opensAt.toISOString(), ends: endsAt.toISOString()
	};
}

function prizeItemOf(kind: NewBounty['prize']['kind']) {
	if (kind === 'hooks_tin') return { itemId: PrizeItemIds.HooksTin, quantity: PrizeQuantities.HooksInTheTin };
	if (kind === 'batch_spool') return { itemId: PrizeItemIds.BatchSpool, quantity: PrizeQuantities.SpoolMetres };
	if (kind === 'bait_drum') return { itemId: PrizeItemIds.BaitDrum, quantity: PrizeQuantities.BaitInTheDrum };
	return NoItem;
}
