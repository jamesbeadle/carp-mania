import type { PageServerLoad } from './$types';
import { GetAnglerDirectory } from '$lib/server/queries/GetAnglerDirectory';

export const load: PageServerLoad = async ({ locals }) => {
	return { anglers: await GetAnglerDirectory(locals) };
};
