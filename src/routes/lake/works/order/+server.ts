import type { RequestHandler } from './$types';
import { OrderGroundworks } from '$lib/server/commands/OrderGroundworks';

export const POST: RequestHandler = async ({ locals, request }) => {
	return OrderGroundworks(locals, await request.json());
};
