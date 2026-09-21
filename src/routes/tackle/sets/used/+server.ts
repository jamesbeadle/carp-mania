import type { RequestHandler } from './$types';
import { TouchRodSet } from '$lib/server/commands/SaveRodSet';
import { readSetId } from '$lib/server/gates/readSetId';

export const POST: RequestHandler = async ({ locals, request }) => TouchRodSet(locals, readSetId(await request.json()));
