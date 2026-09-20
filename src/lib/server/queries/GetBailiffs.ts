import type { BailiffsPanel } from '$lib/contracts/BailiffsPanel';
import { bailiffCapFor, type Bailiff } from '$lib/domain/bailiffs/bailiffTeam';
import { candidatesThisWeek } from '$lib/domain/bailiffs/candidates';
import { requireOwnedLake } from '../gates/requireOwnedLake';

export async function GetBailiffs(locals: App.Locals, now = new Date()): Promise<BailiffsPanel> {
	const lake = await requireOwnedLake(locals);
	const team = await loadBailiffsOf(locals, lake.id);
	return { team, candidates: candidatesThisWeek(lake.id, now), cap: bailiffCapFor(Number(lake.acres)) };
}

export async function loadBailiffsOf(locals: App.Locals, lakeId: string): Promise<Bailiff[]> {
	const { data } = await locals.supabase.from('bailiffs').select('*').eq('lake_id', lakeId).order('hired_at');
	return ((data ?? []) as Bailiff[]).map((bailiff) => ({ ...bailiff, wage: Number(bailiff.wage), performance: Number(bailiff.performance), aptitude: Number(bailiff.aptitude) }));
}
