import type { PageServerLoad } from './$types';
import { GetAnglerPublicProfile } from '$lib/server/queries/GetAnglerPublicProfile';

export const load: PageServerLoad = async ({ locals, params }) => {
	return { angler: await GetAnglerPublicProfile(locals, params.anglerId) };
};
