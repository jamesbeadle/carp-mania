import { WizardStep, type SetupProgress, type SetupStep } from '$lib/contracts/SetupProgress';
import { currentWaterOf } from '$lib/domain/estate/estateRules';
import { hasChosenPlot } from '$lib/domain/sites/chosenPlot';
import type { Lake, Profile } from '$lib/domain/types';
import { loadProfile } from '../gates/requireMoney';
import { requireUser } from '../gates/requireUser';
import { loadMyWaters } from './loadMyWaters';

export async function GetSetupProgress(locals: App.Locals): Promise<SetupProgress> {
	const user = requireUser(locals);
	const [profile, waters] = await Promise.all([loadProfile(locals), loadMyWaters(locals, user.id)]);
	const current = currentWaterOf(waters, profile.current_lake_id);
	const lake = current && !current.is_setup_complete ? current : null;
	const openWaters = waters.filter((water) => water.is_setup_complete);
	return { step: nextStepFor(profile, lake), profile, lake, moneyLeft: Number(profile.money), openWaters };
}

function nextStepFor(profile: Profile, lake: Lake | null): SetupStep {
	if (lake) return WizardStep.Survey;
	if (hasChosenPlot(profile)) return WizardStep.BuySite;
	return WizardStep.ChoosePlot;
}
