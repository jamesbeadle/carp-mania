import type { PageServerLoad } from './$types';
import { GetPublicLakes } from '$lib/server/queries/GetPublicLakes';

export const load: PageServerLoad = async ({ locals }) => {
	return { lakes: await GetPublicLakes(locals) };
};
