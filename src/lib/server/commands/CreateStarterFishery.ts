import { seededRandom } from '$lib/domain/random';
import { classicCarp, classicLake, classicSwims } from '$lib/domain/sites/classicSite';
import type { Lake } from '$lib/domain/types';
import { requireUser } from '../gates/requireUser';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';

export async function CreateStarterFishery(locals: App.Locals, lakeName: string): Promise<Lake> {
	const user = requireUser(locals);
	const trusted = trustedSupabase();
	const { data: lake, error } = await trusted.from('lakes').insert(classicLake(user.id, lakeName, new Date())).select('*').single();
	if (error || !lake) throw new Error(`Could not create your fishery: ${error?.message}`);

	const random = seededRandom(Date.now());
	await trusted.from('swims').insert(classicSwims(lake.id));
	await trusted.from('carp').insert(classicCarp(lake.id, random));
	return lake as Lake;
}
