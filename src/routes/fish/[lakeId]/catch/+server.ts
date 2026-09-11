import type { RequestHandler } from './$types';
import { RecordCatch } from '$lib/server/commands/RecordCatch';

export const POST: RequestHandler = async ({ locals, request }) => {
	return RecordCatch(locals, await request.json());
};
