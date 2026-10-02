import type { AnglerToPin, BadgesDesk } from '$lib/contracts/Badges';
import { requireAdmin } from '../gates/requireAdmin';
import { loadEveryBadge, loadWearersByBadge } from './loadBadges';

type AnglerRow = { id: string; display_name: string };

export async function GetBadgesDesk(locals: App.Locals): Promise<BadgesDesk> {
	await requireAdmin(locals);
	const [badges, wearers, anglers] = await Promise.all([loadEveryBadge(locals.supabase), loadWearersByBadge(locals.supabase), loadEveryAngler(locals)]);
	return { badges: badges.map((badge) => ({ ...badge, wearers: wearers.get(badge.id) ?? [] })), anglers };
}

async function loadEveryAngler(locals: App.Locals): Promise<AnglerToPin[]> {
	const { data } = await locals.supabase.from('profiles').select('id, display_name').order('display_name');
	const rows = (data ?? []) as AnglerRow[];
	return rows.map((row) => ({ id: row.id, name: row.display_name }));
}
