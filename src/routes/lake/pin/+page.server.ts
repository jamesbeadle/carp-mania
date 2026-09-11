import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { PinLakeOnGlobe } from '$lib/server/commands/PinLakeOnGlobe';
import { requireOwnedLake } from '$lib/server/gates/requireOwnedLake';

const HomeOncePinned = '/home';

export const load: PageServerLoad = async ({ locals }) => {
	const lake = await requireOwnedLake(locals);
	if (lake.latitude !== null) redirect(303, HomeOncePinned);
	return { water: { name: lake.name, region: lake.region } };
};

export const actions: Actions = {
	pin: ({ locals, request }) => request.formData().then((formData) => PinLakeOnGlobe(locals, formData))
};
