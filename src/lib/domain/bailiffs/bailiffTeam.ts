import { FeeCollection } from '../economy';
import { WaterScale } from '../waterQuality';

export interface Bailiff {
	id: string;
	lake_id: string;
	name: string;
	wage: number;
	aptitude: number;
	performance: number;
	hired_at: string;
}

export const BailiffTerms = { AcresPerBailiff: 15, BaseWage: 40, WageSwing: 0.2, StartingPerformance: 70 } as const;

export function bailiffCapFor(acres: number) {
	return Math.max(1, Math.ceil(acres / BailiffTerms.AcresPerBailiff));
}

export function bailiffsNeededFor(acres: number) {
	return bailiffCapFor(acres);
}

export function wageFor(performance: number) {
	const swing = ((performance - WaterScale.Best / 2) / (WaterScale.Best / 2)) * BailiffTerms.WageSwing;
	return Math.round(BailiffTerms.BaseWage * (1 + swing));
}

export function teamPerformanceOf(team: Pick<Bailiff, 'performance'>[]) {
	if (team.length === 0) return 0;
	return team.reduce((total, bailiff) => total + Number(bailiff.performance), 0) / team.length;
}

export function teamClearingShare(team: Pick<Bailiff, 'performance'>[], acres: number) {
	if (team.length === 0) return 0;
	const perBailiff = team.map((bailiff) => Number(bailiff.performance) / WaterScale.Best);
	const cover = Math.min(1, team.length / bailiffsNeededFor(acres));
	const averageQuality = perBailiff.reduce((total, share) => total + share, 0) / team.length;
	return averageQuality * cover;
}

export function feeCollectionOf(team: Pick<Bailiff, 'performance'>[]) {
	if (team.length === 0) return FeeCollection.WithoutBailiff;
	const teamShare = teamPerformanceOf(team) / WaterScale.Best;
	return FeeCollection.WithoutBailiff + (FeeCollection.WithBailiff - FeeCollection.WithoutBailiff) * teamShare;
}

export function wagesOf(team: Pick<Bailiff, 'wage'>[]) {
	return team.reduce((total, bailiff) => total + Number(bailiff.wage), 0);
}

export function whyCannotHire(team: Pick<Bailiff, 'id'>[], acres: number) {
	const cap = bailiffCapFor(acres);
	if (team.length >= cap) return `${acres} acres keeps ${cap} ${cap === 1 ? 'bailiff' : 'bailiffs'} busy — that is the team`;
	return null;
}
