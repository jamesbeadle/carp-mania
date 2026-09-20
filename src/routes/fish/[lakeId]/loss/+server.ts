import type { RequestHandler } from './$types';
import { LoseTackle } from '$lib/server/commands/LoseTackle';

export const POST: RequestHandler = async ({ locals, request }) => {
	return LoseTackle(locals, await request.json());
};
