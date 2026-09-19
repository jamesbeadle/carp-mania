import { fail } from '@sveltejs/kit';
import { BountyDraw, OwnersBounty, theLineFor } from '$lib/domain/bounties/bountyDraw';
import { BountyKinds, type BountyKind } from '$lib/domain/bounties/bountyKinds';
import { difficultyBandOf } from '$lib/domain/bounties/difficultyBand';
import { FisheryClock } from '$lib/domain/simulation/elapsedDays';
import type { Carp } from '$lib/domain/types';
import { formatMoney } from '$lib/format/money';
import { readFormChoice, readFormNumber } from '../gates/readFormNumber';
import { loadProfile, moneyShortfall } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';

const NoTarget = null;

export async function PostBounty(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const kind = readFormChoice(formData, 'kind', BountyKinds);
	if (kind.failure) return kind.failure;
	const money = readFormNumber(formData, 'money', OwnersBounty.LeastMoney, OwnersBounty.MostMoney);
	if (money.failure) return money.failure;
	const days = readFormNumber(formData, 'days', BountyDraw.ShortestWindowDays, BountyDraw.LongestWindowDays);
	if (days.failure) return days.failure;
	const shortfall = moneyShortfall(await loadProfile(locals), money.value);
	if (shortfall) return shortfall;
	const carp = await loadCarpOf(locals, lake.id);
	const target = targetFor(kind.value, carp, String(formData.get('targetCarpId') ?? ''));
	const ends = new Date(Date.now() + days.value * FisheryClock.RealMillisecondsPerFisheryDay).toISOString();
	const band = bandFor(kind.value, carp, target.weightLb);
	const posting = { lake: lake.id, kind: kind.value, band, target_carp: target.carpId, target_lb: target.weightLb, money: money.value, ends };
	const { error } = await locals.supabase.rpc('post_bounty', posting);
	if (error) return fail(400, { message: error.message });
	return { message: `${formatMoney(money.value)} is on the water for ${days.value} days` };
}

async function loadCarpOf(locals: App.Locals, lakeId: string): Promise<Carp[]> {
	const { data } = await locals.supabase.from('carp').select('*').eq('lake_id', lakeId);
	return (data ?? []) as Carp[];
}

function targetFor(kind: BountyKind, carp: Carp[], chosenCarpId: string) {
	if (kind === 'named_fish') {
		const chosen = carp.find((fish) => fish.id === chosenCarpId);
		return { carpId: chosen?.id ?? NoTarget, weightLb: chosen ? Number(chosen.weight_lb) : NoTarget };
	}
	if (kind === 'over_the_line') return { carpId: NoTarget, weightLb: carp.length > 0 ? theLineFor(carp) : NoTarget };
	return { carpId: NoTarget, weightLb: NoTarget };
}

function bandFor(kind: BountyKind, carp: Carp[], targetWeightLb: number | null) {
	const bestLb = carp.reduce((best, fish) => Math.max(best, Number(fish.weight_lb)), 0);
	const fishOverLine = carp.filter((fish) => Number(fish.weight_lb) >= (targetWeightLb ?? bestLb)).length;
	return difficultyBandOf({ kind, targetWeightLb }, { bestLb, fishOverLine });
}
