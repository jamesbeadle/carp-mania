import type { BrandName } from '../tackle/brands';
import type { Lake } from '../types';

export type OfferStatus = 'open' | 'accepted' | 'rejected' | 'expired' | 'superseded';

export interface SponsorshipOffer {
	id: string;
	lakeId: string;
	brand: BrandName;
	termMonths: number;
	amount: number;
	offeredAt: string;
	expiresAt: string;
	status: OfferStatus;
}

export interface LakeSponsorship {
	id: string;
	lakeId: string;
	brand: BrandName;
	termMonths: number;
	amount: number;
	signedAt: string;
	runsUntil: string;
}

export const SponsorshipTerm = { MonthsPerTerm: 6, FewestTerms: 1, MostTerms: 6, FisheryDaysPerMonth: 30 } as const;
export const OfferLife = { ExpiresAfterFisheryDays: 30, MostOpenAtOnce: 2, RenewalWindowFisheryDays: 30 } as const;

export function termsOf(termMonths: number) {
	return termMonths / SponsorshipTerm.MonthsPerTerm;
}

export function isTermMonths(value: number) {
	const terms = termsOf(value);
	return Number.isInteger(terms) && terms >= SponsorshipTerm.FewestTerms && terms <= SponsorshipTerm.MostTerms;
}

export function termWords(termMonths: number) {
	const isYears = termMonths % 12 === 0;
	if (!isYears) return `${termMonths} months`;
	const years = termMonths / 12;
	return years === 1 ? 'a year' : `${years} years`;
}

export function isOfferOpen(offer: Pick<SponsorshipOffer, 'status' | 'expiresAt'>, now: Date) {
	return offer.status === 'open' && new Date(offer.expiresAt).getTime() > now.getTime();
}

export function isSponsorshipRunning(deal: Pick<LakeSponsorship, 'runsUntil'> | null, now: Date) {
	return deal !== null && new Date(deal.runsUntil).getTime() > now.getTime();
}

export function sponsorOnTheBoards(lake: Pick<Lake, 'sponsor_brand' | 'sponsored_until'>, now: Date): BrandName | null {
	if (!lake.sponsor_brand || !lake.sponsored_until) return null;
	const isRunning = new Date(lake.sponsored_until).getTime() > now.getTime();
	return isRunning ? lake.sponsor_brand : null;
}
