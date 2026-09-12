import type { Catch, Profile } from '$lib/domain/types';
import { loadProfile } from '../gates/requireMoney';
import { loadCarpNames } from './loadAnglerCatches';
import { loadLakeNames } from './loadCarpHistory';

const CatchHistoryLimit = 50;

export interface AnglerProfile {
	profile: Profile;
	catches: Catch[];
	carpNames: Record<string, string>;
	lakeNames: Record<string, string>;
	personalBestLb: number;
	totalCatches: number;
}

export async function GetAnglerProfile(locals: App.Locals): Promise<AnglerProfile> {
	const profile = await loadProfile(locals);
	const [{ data: catches }, { count }] = await Promise.all([
		locals.supabase.from('catches').select('*').eq('angler_id', profile.id).order('caught_at', { ascending: false }).limit(CatchHistoryLimit),
		locals.supabase.from('catches').select('id', { count: 'exact', head: true }).eq('angler_id', profile.id)
	]);
	const { data: heaviest } = await locals.supabase.from('catches').select('weight_lb').eq('angler_id', profile.id).order('weight_lb', { ascending: false }).limit(1).maybeSingle();
	const history = (catches ?? []) as Catch[];
	const [carpNames, lakeNames] = await Promise.all([
		loadCarpNames(locals, history.map((caught) => caught.carp_id)),
		loadLakeNames(locals, history.map((caught) => caught.lake_id))
	]);
	return {
		profile,
		catches: history,
		carpNames,
		lakeNames,
		personalBestLb: heaviest ? Number(heaviest.weight_lb) : 0,
		totalCatches: count ?? 0
	};
}
