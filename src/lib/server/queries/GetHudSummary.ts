import { requireUser } from '../gates/requireUser';

export interface HudSummary {
	money: number;
}

export async function GetHudSummary(locals: App.Locals): Promise<HudSummary> {
	const user = requireUser(locals);
	const { data: profile } = await locals.supabase.from('profiles').select('money').eq('id', user.id).maybeSingle();
	return { money: Number(profile?.money ?? 0) };
}
