import type { Actions, PageServerLoad } from './$types';
import { AwardBadge } from '$lib/server/commands/AwardBadge';
import { CreateBadge } from '$lib/server/commands/CreateBadge';
import { GetBadgesDesk } from '$lib/server/queries/GetBadgesDesk';

export const load: PageServerLoad = async ({ locals }) => {
	return { desk: await GetBadgesDesk(locals) };
};

export const actions: Actions = {
	createBadge: ({ locals, request }) => request.formData().then((formData) => CreateBadge(locals, formData)),
	awardBadge: ({ locals, request }) => request.formData().then((formData) => AwardBadge(locals, formData))
};
