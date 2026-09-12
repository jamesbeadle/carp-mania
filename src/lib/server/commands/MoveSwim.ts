import { fail } from '@sveltejs/kit';
import { whySwimIsRefused } from '$lib/domain/groundworks/swimPlacement';
import { SwimRules } from '$lib/domain/layout/swimRules';
import { formatMoney } from '$lib/format/money';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { loadProfile, moneyShortfall, spendMoney } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { findSwim, loadSwimsOf, readSwimPoint } from './swimGates';

export async function MoveSwim(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const found = findSwim(await loadSwimsOf(locals, lake.id), formData);
	if (found.failure) return found.failure;
	const point = readSwimPoint(formData);
	if (point.failure) return point.failure;
	const refusal = whySwimIsRefused(lake, found.others, point.point, 'move');
	if (refusal) return fail(400, { message: refusal });

	const profile = await loadProfile(locals);
	const shortfall = moneyShortfall(profile, SwimRules.MoveCost);
	if (shortfall) return shortfall;

	await trustedSupabase().from('swims').update({ position_x: point.point.x, position_y: point.point.y }).eq('id', found.swim.id);
	await spendMoney(profile, SwimRules.MoveCost);
	return { message: `Moved ${found.swim.name} for ${formatMoney(SwimRules.MoveCost)}` };
}
