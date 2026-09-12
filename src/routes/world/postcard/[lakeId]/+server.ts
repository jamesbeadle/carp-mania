import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GetLakePostcard } from '$lib/server/queries/GetLakePostcard';

export const GET: RequestHandler = async ({ locals, params }) => {
	return json(await GetLakePostcard(locals, params.lakeId));
};
