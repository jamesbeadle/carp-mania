import { fail } from '@sveltejs/kit';
import { whyCannotBuyAnotherWater } from '$lib/domain/estate/estateRules';
import { loadMyWaters } from '../queries/loadMyWaters';
import { requireUser } from './requireUser';

export async function roomForAnotherWater(locals: App.Locals) {
	const user = requireUser(locals);
	const refusal = whyCannotBuyAnotherWater(await loadMyWaters(locals, user.id));
	return refusal ? fail(400, { message: refusal }) : null;
}
