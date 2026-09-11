import { seededRandom } from '$lib/domain/random';
import { starterCarp, starterLake, starterSwims } from '$lib/domain/starterFishery';
import type { Lake } from '$lib/domain/types';
import { requireUser } from '../gates/requireUser';

export async function CreateStarterFishery(locals: App.Locals, lakeName: string): Promise<Lake> {
	const user = requireUser(locals);
	const { data: lake, error } = await locals.supabase
		.from('lakes')
		.insert(starterLake(user.id, lakeName, new Date()))
		.select('*')
		.single();
	if (error || !lake) throw new Error(`Could not create your fishery: ${error?.message}`);

	const random = seededRandom(Date.now());
	await locals.supabase.from('swims').insert(starterSwims(lake.id));
	await locals.supabase.from('carp').insert(starterCarp(lake.id, random));
	return lake as Lake;
}
