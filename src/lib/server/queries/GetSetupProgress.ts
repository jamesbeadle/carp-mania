import { WizardStep, type SetupProgress, type SetupStep } from '$lib/contracts/SetupProgress';
import { hasChosenPlot } from '$lib/domain/sites/chosenPlot';
import type { Lake, Profile } from '$lib/domain/types';
import { loadProfile } from '../gates/requireMoney';
import { requireUser } from '../gates/requireUser';

export async function GetSetupProgress(locals: App.Locals): Promise<SetupProgress> {
	const user = requireUser(locals);
	const [profile, lake] = await Promise.all([loadProfile(locals), loadOwnLake(locals, user.id)]);
	return { step: nextStepFor(profile, lake), profile, lake, moneyLeft: Number(profile.money) };
}

function nextStepFor(profile: Profile, lake: Lake | null): SetupStep {
	if (lake) return WizardStep.Survey;
	if (hasChosenPlot(profile)) return WizardStep.BuySite;
	return WizardStep.ChoosePlot;
}

async function loadOwnLake(locals: App.Locals, ownerId: string): Promise<Lake | null> {
	const { data: lake } = await locals.supabase.from('lakes').select('*').eq('owner_id', ownerId).maybeSingle();
	return lake as Lake | null;
}
