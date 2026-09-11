import type { RequestHandler } from './$types';
import { SaveRodSetups } from '$lib/server/commands/SaveRodSetups';

export const POST: RequestHandler = async ({ locals, request }) => {
	return SaveRodSetups(locals, await request.json());
};
