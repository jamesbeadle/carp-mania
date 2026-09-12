import type { PageServerLoad } from './$types';
import { GetMatchNoticeboard } from '$lib/server/queries/GetMatchNoticeboard';

export const load: PageServerLoad = async ({ locals }) => {
	return { noticeboard: await GetMatchNoticeboard(locals) };
};
