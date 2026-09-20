import { PikeRules } from '$lib/domain/economy';

const FairConditionBelow = 60;

export type ConditionTone = 'danger' | 'surge' | 'volt';

const ToneClass: Record<ConditionTone, string> = { danger: 'text-danger-400', surge: 'text-surge-300', volt: 'text-volt-300' };

export function conditionToneOf(condition: number): ConditionTone {
	if (condition < PikeRules.SickCarpConditionBelow) return 'danger';
	if (condition < FairConditionBelow) return 'surge';
	return 'volt';
}

export function conditionTone(condition: number) {
	return ToneClass[conditionToneOf(condition)];
}
