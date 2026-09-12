import type { SkyOver } from '$lib/game/sky/skyOver';
import { requireUser } from '../gates/requireUser';

export interface HudSummary {
	money: number;
	skyOver: SkyOver | null;
}

type ProfileRow = { money: number; current_lake_id: string | null };

export async function GetHudSummary(locals: App.Locals): Promise<HudSummary> {
	const user = requireUser(locals);
	const [{ data: profile }, { data: waters }] = await Promise.all([
		locals.supabase.from('profiles').select('money, current_lake_id').eq('id', user.id).maybeSingle(),
		locals.supabase.from('lakes').select('id, region, latitude').eq('owner_id', user.id).order('created_at')
	]);
	const row = profile as ProfileRow | null;
	const mine = (waters ?? []) as SkyOver[];
	return { money: Number(row?.money ?? 0), skyOver: mine.find((water) => water.id === row?.current_lake_id) ?? mine[0] ?? null };
}
