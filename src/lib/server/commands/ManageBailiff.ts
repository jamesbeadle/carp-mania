import { Prices } from '$lib/domain/economy';
import { requireOwnedLake } from '../gates/requireOwnedLake';

export async function HireBailiff(locals: App.Locals) {
	const lake = await requireOwnedLake(locals);
	await locals.supabase.from('lakes').update({ has_bailiff: true }).eq('id', lake.id);
	return { message: `Bailiff hired at £${Prices.BailiffDailyWage} a day` };
}

export async function DismissBailiff(locals: App.Locals) {
	const lake = await requireOwnedLake(locals);
	await locals.supabase.from('lakes').update({ has_bailiff: false }).eq('id', lake.id);
	return { message: 'Bailiff dismissed' };
}
