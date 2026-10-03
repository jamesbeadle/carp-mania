import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { NameCheckParam } from '$lib/contracts/AnglerLicence';
import { IsAnglerNameFree } from '$lib/server/queries/IsAnglerNameFree';

export const GET: RequestHandler = async ({ locals, url }) => json(await IsAnglerNameFree(locals, url.searchParams.get(NameCheckParam) ?? ''));
