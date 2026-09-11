export const ReputationScale = { Lowest: 0, Highest: 100, Starter: 20 } as const;

const ReputationGain = {
	PerCatch: 0.05,
	PerPoundAboveTwenty: 0.05,
	PerPoundAboveThirty: 0.12
} as const;

const ReputationDrift = { DailyDecay: 0.15, WaterQualityWeight: 0.02 } as const;

export function reputationFromCatch(weightPounds: number, currentReputation: number) {
	const aboveTwenty = Math.max(0, weightPounds - 20);
	const aboveThirty = Math.max(0, weightPounds - 30);
	const rawGain = ReputationGain.PerCatch + aboveTwenty * ReputationGain.PerPoundAboveTwenty + aboveThirty * ReputationGain.PerPoundAboveThirty;
	return rawGain * headroomFor(currentReputation);
}

function headroomFor(reputation: number) {
	return 1 - reputation / ReputationScale.Highest;
}

export function driftReputationForOneDay(reputation: number, waterQuality: number) {
	const pullTowardWater = (waterQuality - reputation) * ReputationDrift.WaterQualityWeight;
	return clampReputation(reputation - ReputationDrift.DailyDecay + pullTowardWater);
}

export function clampReputation(value: number) {
	return Math.min(ReputationScale.Highest, Math.max(ReputationScale.Lowest, Math.round(value * 100) / 100));
}

export function anglersPerDayFor(reputation: number) {
	return Math.max(1, Math.round(reputation / 8));
}

export function typicalAnglerSkillFor(reputation: number) {
	return Math.min(95, 20 + reputation * 0.7);
}
