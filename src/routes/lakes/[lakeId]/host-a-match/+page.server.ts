import type { Actions, PageServerLoad } from './$types';
import { countOpenMatchesHostedBy, HostMatch } from '$lib/server/commands/HostMatch';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { requireUser } from '$lib/server/gates/requireUser';
import { GetLake } from '$lib/server/queries/GetLake';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = requireUser(locals);
	const [water, profile, openMatchesHosted] = await Promise.all([GetLake(locals, params.lakeId), loadProfile(locals), countOpenMatchesHostedBy(locals, user.id)]);
	return { water, profile, openMatchesHosted };
};

export const actions: Actions = {
	host: ({ locals, params, request }) => request.formData().then((formData) => HostMatch(locals, params.lakeId, formData))
};
