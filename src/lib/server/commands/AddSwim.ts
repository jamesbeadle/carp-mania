import { fail } from '@sveltejs/kit';
import { whySwimIsRefused } from '$lib/domain/groundworks/swimPlacement';
import { SwimRules } from '$lib/domain/layout/swimRules';
import { formatMoney } from '$lib/format/money';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { loadProfile, moneyShortfall, spendMoney } from '../gates/requireMoney';
import { requireOwnedLake } from '../gates/requireOwnedLake';
import { loadSwimsOf, readSwimName, readSwimPoint } from './swimGates';

export async function AddSwim(locals: App.Locals, formData: FormData) {
	const lake = await requireOwnedLake(locals);
	const swims = await loadSwimsOf(locals, lake.id);
	const name = readSwimName(formData, swims);
	if (name.failure) return name.failure;
	const point = readSwimPoint(formData);
	if (point.failure) return point.failure;
	const refusal = whySwimIsRefused(lake, swims, point.point, 'build');
	if (refusal) return fail(400, { message: refusal });

	const profile = await loadProfile(locals);
	const shortfall = moneyShortfall(profile, SwimRules.BuildCost);
	if (shortfall) return shortfall;

	await trustedSupabase().from('swims').insert({ lake_id: lake.id, name: name.name, position_x: point.point.x, position_y: point.point.y });
	await spendMoney(profile, SwimRules.BuildCost);
	return { message: `Built ${name.name} for ${formatMoney(SwimRules.BuildCost)}` };
}
