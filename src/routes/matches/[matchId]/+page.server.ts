import type { Actions, PageServerLoad } from './$types';
import { CancelMatch } from '$lib/server/commands/CancelMatch';
import { EnterMatch } from '$lib/server/commands/EnterMatch';
import { GetMatch } from '$lib/server/queries/GetMatch';
import { BoardRefresh } from './boardRefresh';

export const load: PageServerLoad = async ({ locals, params, depends }) => {
	depends(BoardRefresh.Dependency);
	return { page: await GetMatch(locals, params.matchId) };
};

export const actions: Actions = {
	enter: ({ locals, request }) => request.formData().then((formData) => EnterMatch(locals, formData)),
	cancel: ({ locals, request }) => request.formData().then((formData) => CancelMatch(locals, formData))
};
