import type { RequestHandler } from './$types';
import { RecordCatch, type CatchReport } from '$lib/server/commands/RecordCatch';

export const POST: RequestHandler = async ({ locals, request }) => {
	const report = (await request.json()) as CatchReport;
	return RecordCatch(locals, report);
};
