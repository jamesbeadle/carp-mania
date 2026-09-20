import { error } from '@sveltejs/kit';
import type { CatchReport } from '$lib/contracts/CatchReport';
import type { NewNamedFish } from '$lib/domain/stock/individualise';
import type { Shoal } from '$lib/domain/stock/shoals';
import { kitFor } from '$lib/domain/tackle/rodSetup';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import type { CatchHonours } from '$lib/contracts/CatchReport';
import { loadBountyWonBy } from '../queries/GetBounties';
import { RaiseAwards } from './RaiseAwards';

const HttpStatus = { BadRequest: 400 } as const;
const HoursInADay = 24;

function tackleArguments(report: CatchReport) {
	const kit = kitFor(report.setup);
	return {
		swim_name: report.swimName,
		rig: kit.rig.rig,
		bait: kit.bait.bait.kind,
		hook_size: kit.hook.hook.size,
		line_gain: report.skillGains.line,
		rig_gain: report.skillGains.rig,
		bait_gain: report.skillGains.bait,
		watercraft_gain: report.skillGains.watercraft,
		rod_item: kit.rod.id,
		reel_item: kit.reel.id,
		bait_item: kit.bait.id,
		hour_of_day: Math.floor(report.hour) % HoursInADay
	};
}

export async function recordNamedCatch(anglerId: string, report: CatchReport, carpId: string): Promise<string> {
	const { data: catchId, error: recordError } = await trustedSupabase().rpc('record_catch', { angler: anglerId, visit: report.visitId, fish: carpId, ...tackleArguments(report) });
	if (recordError) error(HttpStatus.BadRequest, recordError.message);
	return catchId as string;
}

export async function recordShoalCatch(anglerId: string, report: CatchReport, shoal: Shoal, fish: NewNamedFish): Promise<{ carpId: string; catchId: string }> {
	const { data: carpId, error: recordError } = await trustedSupabase().rpc('record_shoal_catch', {
		angler: anglerId,
		visit: report.visitId,
		shoal: shoal.id,
		fish_name: fish.name,
		fish_strain: fish.strain,
		fish_weight: fish.weight_lb,
		...tackleArguments(report)
	});
	if (recordError) error(HttpStatus.BadRequest, recordError.message);
	return { carpId: carpId as string, catchId: await latestCatchOf(carpId as string) };
}

async function latestCatchOf(carpId: string) {
	const { data } = await trustedSupabase().from('catches').select('id').eq('carp_id', carpId).order('caught_at', { ascending: false }).limit(1);
	const [row] = (data ?? []) as { id: string }[];
	return row?.id ?? carpId;
}

export async function honoursAfterTheCatch(anglerId: string, catchId: string): Promise<CatchHonours> {
	const trusted = trustedSupabase();
	const [awards, bounty] = await Promise.all([RaiseAwards(anglerId, catchId), loadBountyWonBy(trusted, catchId)]);
	const bountyWon = bounty ? { kind: bounty.kind, prizeKind: bounty.prizeKind, prizeMoney: bounty.prizeMoney } : null;
	return { awards, bountyWon };
}
