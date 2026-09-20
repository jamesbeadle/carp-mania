import { pickRandom, type RandomFraction } from '../random';
import { BrandCatalogue, type BrandName, type Tier } from '../tackle/brands';
import { PrototypeDesigns } from '../tackle/prototypes';
import type { DifficultyBand } from './difficultyBand';

export type PrizeKind = 'money' | 'brand_credit' | 'hooks_tin' | 'batch_spool' | 'bait_drum' | 'sponsorship' | 'prototype' | 'peg_at_a_legend' | 'stocked_fish';

export interface Prize {
	kind: PrizeKind;
	money: number;
	brand: BrandName | null;
	designId: string | null;
}

export const PrizeWords: Record<PrizeKind, string> = {
	money: 'in prize money',
	brand_credit: 'of brand credit',
	hooks_tin: 'a tin of hand-picked hooks that never straighten',
	batch_spool: 'a batch spool no shop sells',
	bait_drum: 'a drum of bait above the shelf',
	sponsorship: 'a sponsorship for a fishery year',
	prototype: 'a one-of-one prototype',
	peg_at_a_legend: 'a peg at a legend',
	stocked_fish: 'a thirty delivered to your water'
};

export const PrizeMoney = { Floor: 400, ShareOfBestGuidePrice: 0.15, RoundedTo: 50 } as const;
export const BrandCreditRange = { Least: 250, Most: 2000, Step: 250 } as const;
export const TackleShareOfBounties = 1 / 3;
export const StockedFish = { WeightLb: 30, Strain: 'mirror' } as const;

const PrizesByBand: Record<DifficultyBand, PrizeKind[]> = {
	easy: ['brand_credit', 'hooks_tin'],
	moderate: ['hooks_tin', 'batch_spool', 'bait_drum'],
	hard: ['sponsorship', 'peg_at_a_legend'],
	very_hard: ['prototype', 'stocked_fish']
};

const SponsorTierByBand: Record<DifficultyBand, Tier[]> = {
	easy: ['starter', 'club'],
	moderate: ['club'],
	hard: ['specialist'],
	very_hard: ['custom']
};

export function prizeMoneyFor(bestFishGuidePrice: number) {
	const raw = PrizeMoney.Floor + bestFishGuidePrice * PrizeMoney.ShareOfBestGuidePrice;
	return Math.round(raw / PrizeMoney.RoundedTo) * PrizeMoney.RoundedTo;
}

export function sponsorFor(band: DifficultyBand, random: RandomFraction): BrandName {
	const tiers = SponsorTierByBand[band];
	const brands = (Object.keys(BrandCatalogue) as BrandName[]).filter((brand) => tiers.includes(BrandCatalogue[brand].tier));
	return pickRandom(random, brands);
}

export function drawPrize(band: DifficultyBand, sponsor: BrandName, bestFishGuidePrice: number, random: RandomFraction): Prize {
	const isTackle = random() < TackleShareOfBounties;
	if (!isTackle) return { kind: 'money', money: prizeMoneyFor(bestFishGuidePrice), brand: null, designId: null };
	const kind = pickRandom(random, PrizesByBand[band]);
	if (kind === 'brand_credit') return { kind, money: brandCreditFor(random), brand: sponsor, designId: null };
	if (kind === 'prototype') return { kind, money: 0, brand: sponsor, designId: prototypeDesignFor(sponsor, random) };
	return { kind, money: 0, brand: sponsor, designId: null };
}

function brandCreditFor(random: RandomFraction) {
	const steps = (BrandCreditRange.Most - BrandCreditRange.Least) / BrandCreditRange.Step;
	return BrandCreditRange.Least + Math.floor(random() * (steps + 1)) * BrandCreditRange.Step;
}

function prototypeDesignFor(sponsor: BrandName, random: RandomFraction) {
	const ownDesigns = PrototypeDesigns.filter((design) => design.brand === sponsor);
	const designs = ownDesigns.length > 0 ? ownDesigns : PrototypeDesigns;
	return pickRandom(random, designs).id;
}
