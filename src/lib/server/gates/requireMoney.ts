import { fail } from '@sveltejs/kit';
import type { Profile } from '$lib/domain/types';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { requireUser } from './requireUser';

export async function loadProfile(locals: App.Locals): Promise<Profile> {
	const user = requireUser(locals);
	const { data: profile } = await locals.supabase.from('profiles').select('*').eq('id', user.id).single();
	return profile as Profile;
}

export function moneyShortfall(profile: Profile, cost: number) {
	if (Number(profile.money) >= cost) return null;
	return fail(400, { message: `That costs £${cost.toFixed(2)} and you have £${Number(profile.money).toFixed(2)}` });
}

export async function spendMoney(profile: Profile, cost: number) {
	await trustedSupabase().from('profiles').update({ money: Number(profile.money) - cost }).eq('id', profile.id);
}
