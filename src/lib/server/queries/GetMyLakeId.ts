import { requireUser } from '../gates/requireUser';
import { loadCurrentWater } from './loadMyWaters';

export async function GetMyLakeId(locals: App.Locals): Promise<string | null> {
	const user = requireUser(locals);
	const water = await loadCurrentWater(locals, user.id);
	return water?.id ?? null;
}
