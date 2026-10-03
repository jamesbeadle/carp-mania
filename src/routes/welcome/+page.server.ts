import { isActionFailure, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { SignTheLicence } from '$lib/server/commands/SignTheLicence';
import { GetLicenceDraft } from '$lib/server/queries/GetLicenceDraft';

const FindYourWater = '/setup';

export const load: PageServerLoad = async ({ locals }) => {
	const draft = await GetLicenceDraft(locals);
	if (draft.isSigned) redirect(303, FindYourWater);
	return { draft, isImmersive: true };
};

export const actions: Actions = {
	sign: async ({ locals, request }) => {
		const signed = await SignTheLicence(locals, await request.formData());
		if (isActionFailure(signed)) return signed;
		redirect(303, FindYourWater);
	}
};
