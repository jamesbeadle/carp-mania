import type { PageServerLoad } from './$types';
import { GetCarpDossier } from '$lib/server/queries/GetCarpDossier';
import { GetMemorialDossier } from '$lib/server/queries/GetMemorialDossier';
import { loadMemorial } from '$lib/server/queries/loadMemorialNames';

export const load: PageServerLoad = async ({ locals, params }) => {
	const remembered = await loadMemorial(locals, params.carpId);
	if (remembered) return { memorial: await GetMemorialDossier(locals, remembered), dossier: null };
	return { dossier: await GetCarpDossier(locals, params.carpId), memorial: null };
};
