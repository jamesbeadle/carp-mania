import type { Actions, PageServerLoad } from './$types';
import { countOpenMatchesHostedBy, HostMatch } from '$lib/server/commands/HostMatch';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetLake } from '$lib/server/queries/GetLake';

export const load: PageServerLoad = async ({ locals, params }) => {
	const [water, profile] = await Promise.all([GetLake(locals, params.lakeId), loadProfile(locals)]);
	const openMatchesHosted = await countOpenMatchesHostedBy(locals, profile.id);
	return { water, profile, openMatchesHosted };
};

export const actions: Actions = {
	host: ({ locals, params, request }) => request.formData().then((formData) => HostMatch(locals, params.lakeId, formData))
};
