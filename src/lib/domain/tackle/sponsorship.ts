import type { BrandName } from './brands';
import type { TackleItem } from './tackleItem';

export interface Sponsorship {
	brand: BrandName;
	runsUntil: string;
}

export interface BrandCredit {
	brand: BrandName;
	amount: number;
}

export const SponsorshipTerms = { Discount: 0.4, FisheryYearDays: 365 } as const;
const NoCredit = 0;

export function isSponsoredBy(sponsorships: Sponsorship[], brand: string, now: Date) {
	const isRunning = (sponsorship: Sponsorship) => new Date(sponsorship.runsUntil).getTime() > now.getTime();
	return sponsorships.some((sponsorship) => sponsorship.brand === brand && isRunning(sponsorship));
}

export function priceUnderSponsorship(price: number) {
	return Math.round(price * (1 - SponsorshipTerms.Discount));
}

export function creditWith(credits: BrandCredit[], brand: string) {
	return credits.find((credit) => credit.brand === brand)?.amount ?? NoCredit;
}

export interface TillReceipt {
	price: number;
	fromCredit: number;
	fromPocket: number;
	isSponsored: boolean;
}

export function tillReceiptFor(item: Pick<TackleItem, 'brand' | 'price'>, packs: number, sponsorships: Sponsorship[], credits: BrandCredit[], now: Date): TillReceipt {
	const isSponsored = isSponsoredBy(sponsorships, item.brand, now);
	const eachPack = isSponsored ? priceUnderSponsorship(item.price) : item.price;
	const price = packs * eachPack;
	const fromCredit = Math.min(price, creditWith(credits, item.brand));
	return { price, fromCredit, fromPocket: price - fromCredit, isSponsored };
}
