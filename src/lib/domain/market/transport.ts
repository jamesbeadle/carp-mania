import { FisheryClock } from '../simulation/elapsedDays';
import { greatCircleKilometres, type GlobePoint } from '../world/greatCircle';
import type { RegionCode } from '../world/regionCodes';

export const TransportTerms = {
	BaseCost: 250,
	CostPerKilometre: 0.35,
	KilometresPerFisheryDay: 800,
	QuarantineDaysAcrossRegions: 5,
	StressPerKilometres: 200,
	MaximumStress: 25,
	LowestConditionAfterStress: 5
} as const;

export interface TransportQuote {
	distanceKilometres: number;
	cost: number;
	transitDays: number;
	quarantineDays: number;
	conditionLoss: number;
}

export interface LakeOnGlobe extends GlobePoint {
	region: RegionCode;
}

export function transportQuote(from: LakeOnGlobe, to: LakeOnGlobe): TransportQuote {
	const distanceKilometres = greatCircleKilometres(from, to);
	return {
		distanceKilometres,
		cost: Math.round(TransportTerms.BaseCost + distanceKilometres * TransportTerms.CostPerKilometre),
		transitDays: Math.max(1, Math.ceil(distanceKilometres / TransportTerms.KilometresPerFisheryDay)),
		quarantineDays: from.region === to.region ? 0 : TransportTerms.QuarantineDaysAcrossRegions,
		conditionLoss: Math.min(TransportTerms.MaximumStress, Math.floor(distanceKilometres / TransportTerms.StressPerKilometres))
	};
}

export function conditionAfterTransport(condition: number, quote: TransportQuote) {
	return Math.max(TransportTerms.LowestConditionAfterStress, condition - quote.conditionLoss);
}

export function arrivalTimes(departedAt: Date, quote: TransportQuote) {
	const arrivesAt = new Date(departedAt.getTime() + quote.transitDays * FisheryClock.RealMillisecondsPerFisheryDay);
	const quarantineUntil = new Date(arrivesAt.getTime() + quote.quarantineDays * FisheryClock.RealMillisecondsPerFisheryDay);
	return { arrivesAt, quarantineUntil: quote.quarantineDays === 0 ? null : quarantineUntil };
}
