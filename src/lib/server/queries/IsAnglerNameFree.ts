import type { NameAvailability } from '$lib/contracts/AnglerLicence';
import { anglerNameRuleWords, isAnglerName } from '$lib/domain/anglerName';
import { requireUser } from '../gates/requireUser';

const FreeWords = 'Free — nobody fishes under that name';
const TakenWords = 'Taken — another angler already fishes as';

export async function IsAnglerNameFree(locals: App.Locals, wanted: string): Promise<NameAvailability> {
	const user = requireUser(locals);
	const name = wanted.trim();
	if (!isAnglerName(name)) return { name, isFree: false, reason: `An angler name is ${anglerNameRuleWords()}` };
	const { count } = await locals.supabase.from('profiles').select('id', { count: 'exact', head: true }).ilike('display_name', name).neq('id', user.id);
	const isTaken = (count ?? 0) > 0;
	if (isTaken) return { name, isFree: false, reason: `${TakenWords} ${name}` };
	return { name, isFree: true, reason: FreeWords };
}
