import type { PageServerLoad } from './$types';
import { GetTackleBox } from '$lib/server/queries/GetTackleBox';

export const load: PageServerLoad = async ({ locals }) => {
	return { box: await GetTackleBox(locals) };
};
