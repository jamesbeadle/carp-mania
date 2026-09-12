import { error } from '@sveltejs/kit';
import type { FishermanDiary } from '$lib/contracts/FishermanDiary';
import { diaryAgeOf, isRetirementDue, isSlowingDown } from '$lib/domain/legacy/diary';
import type { Fisherman } from '$lib/domain/legacy/fishermanTypes';
import { requireUser } from '../gates/requireUser';

const NoLineYet = 'This player has no fisherman yet';

export async function GetFishermanDiary(locals: App.Locals): Promise<FishermanDiary> {
	const user = requireUser(locals);
	return diaryOf(locals, user.id);
}

export async function diaryOf(locals: App.Locals, profileId: string): Promise<FishermanDiary> {
	const line = await loadLine(locals, profileId);
	const current = line.find((fisherman) => fisherman.retired_at === null);
	if (!current) error(500, NoLineYet);
	const now = new Date();
	return { current, line, age: diaryAgeOf(current, now), isRetirementDue: isRetirementDue(current, now), isSlowingDown: isSlowingDown(current, now) };
}

export async function loadLine(locals: App.Locals, profileId: string): Promise<Fisherman[]> {
	const { data } = await locals.supabase.from('fishermen').select('*').eq('profile_id', profileId).order('generation', { ascending: false });
	return (data ?? []) as Fisherman[];
}

export async function loadFisherman(locals: App.Locals, fishermanId: string): Promise<Fisherman | null> {
	const { data } = await locals.supabase.from('fishermen').select('*').eq('id', fishermanId).maybeSingle();
	return (data as Fisherman | null) ?? null;
}
