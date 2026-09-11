import type { PageServerLoad } from './$types';
import { GetAnglerProfile } from '$lib/server/queries/GetAnglerProfile';

export const load: PageServerLoad = async ({ locals }) => {
	return { angler: await GetAnglerProfile(locals) };
};
