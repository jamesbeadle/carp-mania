import type { Actions, PageServerLoad } from './$types';
import { AddSwim } from '$lib/server/commands/AddSwim';
import { BuyAdjacentLand } from '$lib/server/commands/BuyAdjacentLand';
import { CancelGroundworks } from '$lib/server/commands/CancelGroundworks';
import { MoveSwim } from '$lib/server/commands/MoveSwim';
import { RemoveSwim } from '$lib/server/commands/RemoveSwim';
import { RenameSwim } from '$lib/server/commands/RenameSwim';
import { SimulateElapsedTime } from '$lib/server/commands/SimulateElapsedTime';
import { loadProfile } from '$lib/server/gates/requireMoney';
import { GetMyFishery } from '$lib/server/queries/GetMyFishery';
import { GetMyGroundworks } from '$lib/server/queries/GetMyGroundworks';

export const load: PageServerLoad = async ({ locals }) => {
	await SimulateElapsedTime(locals);
	const [fishery, groundworks, profile] = await Promise.all([GetMyFishery(locals), GetMyGroundworks(locals), loadProfile(locals)]);
	return { fishery, groundworks, profile };
};

export const actions: Actions = {
	addSwim: ({ locals, request }) => request.formData().then((formData) => AddSwim(locals, formData)),
	moveSwim: ({ locals, request }) => request.formData().then((formData) => MoveSwim(locals, formData)),
	removeSwim: ({ locals, request }) => request.formData().then((formData) => RemoveSwim(locals, formData)),
	renameSwim: ({ locals, request }) => request.formData().then((formData) => RenameSwim(locals, formData)),
	buyLand: ({ locals }) => BuyAdjacentLand(locals),
	cancelWorks: ({ locals, request }) => request.formData().then((formData) => CancelGroundworks(locals, formData))
};
