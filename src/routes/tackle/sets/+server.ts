import type { RequestHandler } from './$types';
import { SaveRodSet } from '$lib/server/commands/SaveRodSet';

export const POST: RequestHandler = async ({ locals, request }) => SaveRodSet(locals, await request.json());
