import { error, json } from '@sveltejs/kit';
import { requireUser } from '../gates/requireUser';

export interface CatchReport {
	visitId: string;
	carpId: string;
	swimName: string;
	rig: string;
	bait: string;
	hookSize: number;
	skillGains: { line: number; rig: number; bait: number; watercraft: number };
}

export async function RecordCatch(locals: App.Locals, report: CatchReport) {
	requireUser(locals);
	const { data: catchId, error: recordError } = await locals.supabase.rpc('record_catch', {
		visit: report.visitId,
		fish: report.carpId,
		swim_name: report.swimName,
		rig: report.rig,
		bait: report.bait,
		hook_size: report.hookSize,
		line_gain: report.skillGains.line,
		rig_gain: report.skillGains.rig,
		bait_gain: report.skillGains.bait,
		watercraft_gain: report.skillGains.watercraft
	});
	if (recordError) error(400, recordError.message);
	return json({ catchId });
}
