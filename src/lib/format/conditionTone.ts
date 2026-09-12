import { PikeRules } from '$lib/domain/economy';

const FairConditionBelow = 60;

export function conditionTone(condition: number) {
	if (condition < PikeRules.SickCarpConditionBelow) return 'text-danger-400';
	if (condition < FairConditionBelow) return 'text-surge-300';
	return 'text-volt-300';
}
