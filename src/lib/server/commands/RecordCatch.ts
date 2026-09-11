import { error, json } from '@sveltejs/kit';
import type { CatchReport } from '$lib/contracts/CatchReport';
import { overallAnglerSkill } from '$lib/domain/anglerSkills';
import type { WaterToday } from '$lib/domain/fishing/biteRoll';
import { isDayTicketStillValid } from '$lib/domain/fishing/dayTicket';
import { carpForRolledBite } from '$lib/domain/fishing/whoTookTheBait';
import type { Carp, Profile } from '$lib/domain/types';
import { seasonFor } from '$lib/domain/world/seasons';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { readCatchReport } from '../gates/readCatchReport';
import { loadProfile } from '../gates/requireMoney';
import { requireUser } from '../gates/requireUser';
import { hasCaughtDuringVisit, loadVisitOf, loadWaterOf, type VisitOnRecord, type WaterOnRecord } from '../queries/loadVisitForCatch';
import { skillsOf } from '../queries/skillsOf';

const HttpStatus = { BadRequest: 400 } as const;

export async function RecordCatch(locals: App.Locals, body: unknown) {
	const user = requireUser(locals);
	const report = readCatchReport(body);
	if (!report) error(HttpStatus.BadRequest, 'That catch report is not one the bailiff can read');
	const visit = await loadVisitOf(user.id, report.visitId);
	if (!visit) error(HttpStatus.BadRequest, 'No day ticket for this visit');
	if (!isDayTicketStillValid(visit.visited_at, new Date())) error(HttpStatus.BadRequest, 'That day ticket was for another day');

	const [water, profile, hasHadItToday] = await Promise.all([loadWaterOf(visit.lake_id), loadProfile(locals), hasCaughtDuringVisit(user.id, visit, report.carpId)]);
	if (!water) error(HttpStatus.BadRequest, 'That lake is no longer there');
	if (hasHadItToday) error(HttpStatus.BadRequest, 'You have already had that fish today');
	const taker = carpThatWasRolled(report, visit, water, profile);
	if (taker?.id !== report.carpId) error(HttpStatus.BadRequest, 'That is not the fish that took the bait');

	const catchId = await recordInTheBook(user.id, report);
	return json({ catchId });
}

function carpThatWasRolled(report: CatchReport, visit: VisitOnRecord, water: WaterOnRecord, profile: Profile): Carp | null {
	const today: WaterToday = {
		lake: water.lake,
		overallSkill: overallAnglerSkill(skillsOf(profile)),
		season: seasonFor(water.lake, new Date(visit.visited_at))
	};
	return carpForRolledBite({ ...report, seed: visit.seed }, today, water.carp);
}

async function recordInTheBook(anglerId: string, report: CatchReport): Promise<string> {
	const { data: catchId, error: recordError } = await trustedSupabase().rpc('record_catch', {
		angler: anglerId,
		visit: report.visitId,
		fish: report.carpId,
		swim_name: report.swimName,
		rig: report.setup.rig,
		bait: report.setup.bait,
		hook_size: report.setup.hook.size,
		line_gain: report.skillGains.line,
		rig_gain: report.skillGains.rig,
		bait_gain: report.skillGains.bait,
		watercraft_gain: report.skillGains.watercraft
	});
	if (recordError) error(HttpStatus.BadRequest, recordError.message);
	return catchId as string;
}
