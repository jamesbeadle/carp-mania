import type { RequestHandler } from './$types';
import { DropRodSet } from '$lib/server/commands/SaveRodSet';
import { readSetId } from '$lib/server/gates/readSetId';

export const POST: RequestHandler = async ({ locals, request }) => DropRodSet(locals, readSetId(await request.json()));
