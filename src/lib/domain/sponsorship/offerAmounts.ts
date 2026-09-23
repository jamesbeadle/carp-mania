import { BrandCatalogue, TierRank, type BrandName, type Tier } from '../tackle/brands';
import { SponsorshipTerm, termsOf } from './lakeSponsorship';

export const OfferMoney = { LeastWaterRating: 30, LeastPerTerm: 2000, MostPerTerm: 60000, Curve: 1.6, RoundTo: 100, LongerDealBonusPerTerm: 0.04 } as const;
export const BrandMoneyFactor: Record<Tier, number> = { starter: 0.8, club: 1, specialist: 1.15, custom: 1.35 };
const TierForRating: { atLeast: number; tier: Tier }[] = [
	{ atLeast: 82, tier: 'custom' },
	{ atLeast: 60, tier: 'specialist' },
	{ atLeast: 40, tier: 'club' },
	{ atLeast: 0, tier: 'starter' }
];

export function isWaterWorthSponsoring(waterRating: number) {
	return waterRating >= OfferMoney.LeastWaterRating;
}

export function perTermFor(waterRating: number) {
	const { LeastWaterRating, LeastPerTerm, MostPerTerm, Curve } = OfferMoney;
	const share = Math.min(1, Math.max(0, (waterRating - LeastWaterRating) / (100 - LeastWaterRating)));
	const money = LeastPerTerm + Math.pow(share, Curve) * (MostPerTerm - LeastPerTerm);
	return Math.round(money / OfferMoney.RoundTo) * OfferMoney.RoundTo;
}

export function offerAmountFor(waterRating: number, termMonths: number, brand: BrandName) {
	const terms = termsOf(termMonths);
	const longerDealBonus = 1 + OfferMoney.LongerDealBonusPerTerm * (terms - SponsorshipTerm.FewestTerms);
	const money = perTermFor(waterRating) * terms * longerDealBonus * BrandMoneyFactor[BrandCatalogue[brand].tier];
	return Math.round(money / OfferMoney.RoundTo) * OfferMoney.RoundTo;
}

export function sponsorTierFor(waterRating: number): Tier {
	return TierForRating.find((band) => waterRating >= band.atLeast)?.tier ?? 'starter';
}

export function brandsThatWouldSponsor(waterRating: number): BrandName[] {
	const ceiling = TierRank[sponsorTierFor(waterRating)];
	return (Object.keys(BrandCatalogue) as BrandName[]).filter((brand) => TierRank[BrandCatalogue[brand].tier] <= ceiling);
}
