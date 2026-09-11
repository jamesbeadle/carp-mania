import { SwimRules } from '$lib/domain/layout/swimRules';
import { formatMoney } from '$lib/format/money';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { loadProfile, moneyShortfall, spendMoney } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { findSwim, loadSwimsOf } from './swimGates';

export async function RemoveSwim(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const found = findSwim(await loadSwimsOf(locals, lake.id), formData);
	if (found.failure) return found.failure;

	const profile = await loadProfile(locals);
	const shortfall = moneyShortfall(profile, SwimRules.RemoveCost);
	if (shortfall) return shortfall;

	await trustedSupabase().from('swims').delete().eq('id', found.swim.id);
	await spendMoney(profile, SwimRules.RemoveCost);
	return { message: `Took out ${found.swim.name} for ${formatMoney(SwimRules.RemoveCost)}` };
}
