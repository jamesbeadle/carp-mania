import { fail } from '@sveltejs/kit';
import type { Profile } from '$lib/domain/types';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { requireUser } from './requireUser';

const GenericPurchase = 'That';

export async function loadProfile(locals: App.Locals): Promise<Profile> {
	const user = requireUser(locals);
	const { data: profile } = await locals.supabase.from('profiles').select('*').eq('id', user.id).single();
	return profile as Profile;
}

export function moneyShortfall(profile: Profile, cost: number) {
	if (Number(profile.money) >= cost) return null;
	return fail(400, { message: `That costs £${cost.toFixed(2)} and you have £${Number(profile.money).toFixed(2)}` });
}

export async function spendMoney(profile: Profile, cost: number, purpose = GenericPurchase) {
	const { error } = await trustedSupabase().rpc('debit_money', { player: profile.id, pounds: cost, purpose });
	if (error) throw new Error(error.message);
}

export async function creditMoney(profileId: string, pounds: number) {
	const { error } = await trustedSupabase().rpc('credit_money', { player: profileId, pounds });
	if (error) throw new Error(error.message);
}

export async function settleDayTakings(profileId: string, pounds: number) {
	const { error } = await trustedSupabase().rpc('settle_day_takings', { player: profileId, pounds });
	if (error) throw new Error(error.message);
}
