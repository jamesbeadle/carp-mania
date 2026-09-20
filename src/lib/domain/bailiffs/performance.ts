import type { RandomFraction } from '../random';
import { clampToScale } from '../waterQuality';
import type { Bailiff } from './bailiffTeam';

export const PerformanceDrift = { PullTowardsAptitude: 0.15, DailyWobble: 2 } as const;
const PerformanceBands = { OnTopFrom: 80, DoingTheJobFrom: 60, SlippingFrom: 40 } as const;

export function driftPerformanceForOneDay(bailiff: Bailiff, random: RandomFraction): Bailiff {
	const pull = (Number(bailiff.aptitude) - Number(bailiff.performance)) * PerformanceDrift.PullTowardsAptitude;
	const wobble = (random() * 2 - 1) * PerformanceDrift.DailyWobble;
	return { ...bailiff, performance: Math.round(clampToScale(Number(bailiff.performance) + pull + wobble)) };
}

export function driftTeamForOneDay(team: Bailiff[], random: RandomFraction): Bailiff[] {
	return team.map((bailiff) => driftPerformanceForOneDay(bailiff, random));
}

export function performanceWord(performance: number) {
	if (performance >= PerformanceBands.OnTopFrom) return 'on top of it';
	if (performance >= PerformanceBands.DoingTheJobFrom) return 'doing the job';
	if (performance >= PerformanceBands.SlippingFrom) return 'slipping';
	return 'asleep in the lodge';
}
