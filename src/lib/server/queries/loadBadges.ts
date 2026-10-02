import type { SupabaseClient } from '@supabase/supabase-js';
import type { Badge, BadgeHeld, BadgeWearer } from '$lib/contracts/Badges';
import { isBadgeMetal } from '$lib/domain/badges/badgeRules';

type BadgeRow = { id: string; name: string; words: string; metal: string; created_at: string };
type HeldRow = { badge_id: string; citation: string; awarded_at: string; badges: BadgeRow | null };
type WearerRow = { badge_id: string; profile_id: string; citation: string; awarded_at: string; profiles: { display_name: string } | null };

const BadgeColumns = 'id, name, words, metal, created_at';
const UnnamedAngler = 'An angler';

export async function loadBadgesHeld(supabase: SupabaseClient, anglerId: string): Promise<BadgeHeld[]> {
	const { data } = await supabase.from('badge_awards').select(`badge_id, citation, awarded_at, badges (${BadgeColumns})`).eq('profile_id', anglerId).order('awarded_at', { ascending: false });
	const rows = (data ?? []) as unknown as HeldRow[];
	return rows.flatMap(heldFrom);
}

export async function loadEveryBadge(supabase: SupabaseClient): Promise<Badge[]> {
	const { data } = await supabase.from('badges').select(BadgeColumns).order('created_at');
	const rows = (data ?? []) as BadgeRow[];
	return rows.flatMap(badgeFrom);
}

export async function loadWearersByBadge(supabase: SupabaseClient): Promise<Map<string, BadgeWearer[]>> {
	const { data } = await supabase.from('badge_awards').select('badge_id, profile_id, citation, awarded_at, profiles (display_name)').order('awarded_at', { ascending: false });
	const rows = (data ?? []) as unknown as WearerRow[];
	const wearers = new Map<string, BadgeWearer[]>();
	for (const row of rows) {
		const list = wearers.get(row.badge_id) ?? [];
		list.push(wearerFrom(row));
		wearers.set(row.badge_id, list);
	}
	return wearers;
}

function wearerFrom(row: WearerRow): BadgeWearer {
	const angler = row.profiles;
	return { anglerId: row.profile_id, anglerName: angler?.display_name ?? UnnamedAngler, citation: row.citation, awardedAt: row.awarded_at };
}

function badgeFrom(row: BadgeRow): Badge[] {
	const { metal, created_at: createdAt } = row;
	return isBadgeMetal(metal) ? [{ id: row.id, name: row.name, words: row.words, metal, createdAt }] : [];
}

function heldFrom(row: HeldRow): BadgeHeld[] {
	const badge = row.badges ? badgeFrom(row.badges) : [];
	return badge.map(({ id, name, words, metal }) => ({ badgeId: id, name, words, metal, citation: row.citation, awardedAt: row.awarded_at }));
}
