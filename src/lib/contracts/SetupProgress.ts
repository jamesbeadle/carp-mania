import type { Lake, Profile } from '$lib/domain/types';

export type SetupStep = 1 | 2 | 3 | 4 | 5 | 6;

export const SetupSteps: { step: SetupStep; label: string }[] = [
	{ step: 1, label: 'Where' },
	{ step: 2, label: 'Site' },
	{ step: 3, label: 'Name' },
	{ step: 4, label: 'Survey' },
	{ step: 5, label: 'Stock' },
	{ step: 6, label: 'Open the gates' }
];

export const WizardStep = { ChoosePlot: 1, BuySite: 2, Name: 3, Survey: 4, Stock: 5, OpenTheGates: 6 } as const satisfies Record<string, SetupStep>;

export interface SetupProgress {
	step: SetupStep;
	profile: Profile;
	lake: Lake | null;
	moneyLeft: number;
}

export function reachableSteps(progress: Pick<SetupProgress, 'step' | 'lake'>): SetupStep[] {
	if (progress.lake) return [WizardStep.Name, WizardStep.Survey, WizardStep.Stock, WizardStep.OpenTheGates];
	return SetupSteps.map(({ step }) => step).filter((step) => step <= progress.step);
}

export function clampedStep(progress: Pick<SetupProgress, 'step' | 'lake'>, requested: number): SetupStep {
	const reachable = reachableSteps(progress);
	const wanted = reachable.find((step) => step === requested);
	return wanted ?? progress.step;
}
