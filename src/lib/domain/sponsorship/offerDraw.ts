import { FisheryClock } from '../simulation/elapsedDays';
import type { RandomFraction } from '../random';
import { isOfferOpen, isSponsorshipRunning, OfferLife, SponsorshipTerm, type LakeSponsorship, type SponsorshipOffer } from './lakeSponsorship';
import { brandsThatWouldSponsor, isWaterWorthSponsoring, offerAmountFor } from './offerAmounts';

export const OfferDraw = { ChancePerFisheryDay: 0.08 } as const;

export type NewOffer = Omit<SponsorshipOffer, 'id' | 'status'>;

export interface SponsorshipState {
	deal: LakeSponsorship | null;
	offers: SponsorshipOffer[];
}

export function isOpenToOffers(state: SponsorshipState, now: Date) {
	const openCount = state.offers.filter((offer) => isOfferOpen(offer, now)).length;
	if (openCount >= OfferLife.MostOpenAtOnce) return false;
	const deal = state.deal;
	if (deal === null || !isSponsorshipRunning(deal, now)) return true;
	const renewalWindow = OfferLife.RenewalWindowFisheryDays * FisheryClock.RealMillisecondsPerFisheryDay;
	return new Date(deal.runsUntil).getTime() - now.getTime() <= renewalWindow;
}

export function drawOffer(lakeId: string, waterRating: number, random: RandomFraction, offeredAt: Date): NewOffer | null {
	if (!isWaterWorthSponsoring(waterRating)) return null;
	if (random() >= OfferDraw.ChancePerFisheryDay) return null;
	const brands = brandsThatWouldSponsor(waterRating);
	const brand = brands[Math.floor(random() * brands.length)];
	const terms = SponsorshipTerm.FewestTerms + Math.floor(random() * SponsorshipTerm.MostTerms);
	const termMonths = terms * SponsorshipTerm.MonthsPerTerm;
	const expiresAt = new Date(offeredAt.getTime() + OfferLife.ExpiresAfterFisheryDays * FisheryClock.RealMillisecondsPerFisheryDay);
	return { lakeId, brand, termMonths, amount: offerAmountFor(waterRating, termMonths, brand), offeredAt: offeredAt.toISOString(), expiresAt: expiresAt.toISOString() };
}

export function offersOverDays(lakeId: string, waterRating: number, days: number, state: SponsorshipState, random: RandomFraction, from: Date): NewOffer[] {
	const drawn: NewOffer[] = [];
	for (let day = 0; day < days; day++) {
		const offeredAt = new Date(from.getTime() + day * FisheryClock.RealMillisecondsPerFisheryDay);
		const pending = { deal: state.deal, offers: [...state.offers, ...drawn.map(asOpenOffer)] };
		if (!isOpenToOffers(pending, offeredAt)) continue;
		const offer = drawOffer(lakeId, waterRating, random, offeredAt);
		if (offer) drawn.push(offer);
	}
	return drawn;
}

function asOpenOffer(offer: NewOffer): SponsorshipOffer {
	return { ...offer, id: offer.offeredAt, status: 'open' };
}
