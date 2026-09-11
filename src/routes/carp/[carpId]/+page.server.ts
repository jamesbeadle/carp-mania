import type { PageServerLoad } from './$types';
import { GetCarpDossier } from '$lib/server/queries/GetCarpDossier';

export const load: PageServerLoad = async ({ locals, params }) => {
	return { dossier: await GetCarpDossier(locals, params.carpId) };
};
