import { BrandCatalogue, type BrandName } from '../tackle/brands';
import type { BountyKind } from './bountyKinds';
import { PrizeWords, type PrizeKind } from './prizeTackle';

export interface BountyAskWords {
	kind: BountyKind;
	swimName: string | null;
	targetCarpName: string | null;
	targetWeightLb: number | null;
}

export interface BountyPrizeWords {
	prizeKind: PrizeKind;
	prizeMoney: number;
}

const MoneyPrizes: PrizeKind[] = ['money', 'brand_credit'];
const TheOwner = 'the owner';

export function sponsorNameOf(sponsor: string) {
	if (sponsor in BrandCatalogue) return BrandCatalogue[sponsor as BrandName].label;
	return sponsor === TheOwner ? 'The owner' : sponsor;
}

export function askWordsOf(ask: BountyAskWords) {
	const asks: Record<BountyKind, string> = {
		top_of_the_water: 'the biggest fish out',
		named_fish: `${ask.targetCarpName ?? 'one particular fish'}`,
		peg_prize: `the biggest fish from ${ask.swimName ?? 'one peg'}`,
		over_the_line: `the first fish over ${ask.targetWeightLb ?? 0} lb`,
		hard_graft: 'the most fish landed'
	};
	return asks[ask.kind];
}

export function prizeWordsOf(prize: BountyPrizeWords, formatMoney: (pounds: number) => string) {
	const { prizeKind, prizeMoney } = prize;
	if (MoneyPrizes.includes(prizeKind)) return `${formatMoney(prizeMoney)} ${PrizeWords[prizeKind]}`;
	return PrizeWords[prizeKind];
}

export function isPaidInMoney(prizeKind: PrizeKind) {
	return MoneyPrizes.includes(prizeKind);
}
