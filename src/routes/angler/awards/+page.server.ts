import type { PageServerLoad } from './$types';
import { requireUser } from '$lib/server/gates/requireUser';
import { GetAwards } from '$lib/server/queries/GetAwards';

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireUser(locals);
	return { awards: await GetAwards(locals, user.id) };
};
