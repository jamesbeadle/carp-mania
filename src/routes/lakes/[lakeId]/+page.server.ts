import type { PageServerLoad } from './$types';
import { GetLake } from '$lib/server/queries/GetLake';

export const load: PageServerLoad = async ({ locals, params }) => {
	return { water: await GetLake(locals, params.lakeId) };
};
