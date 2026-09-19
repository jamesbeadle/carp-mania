import type { WorldActivity } from '$lib/contracts/WorldActivity';
import { BountyKindCatalogue, isBountyKind } from '$lib/domain/bounties/bountyKinds';
import { PrizeWords, type PrizeKind } from '$lib/domain/bounties/prizeTackle';
import { placeInTheLine } from '$lib/domain/legacy/diary';
import { BrandCatalogue, type BrandName } from '$lib/domain/tackle/brands';
import { isRegionCode, type RegionCode } from '$lib/domain/world/regionCodes';
import { RegionCatalogue } from '$lib/domain/world/regions';
import { formatWhen } from '$lib/format/dates';
import { formatMoney } from '$lib/format/money';
import { formatWeight } from '$lib/format/weight';

export interface PayloadWords {
	fishName: string;
	weight: string;
	price: string;
	region: string;
	scope: string;
	islandName: string;
	anglerName: string | null;
	cause: string | null;
	ageYears: number;
	heirName: string;
	placeInTheLine: string;
	matchTitle: string;
	hostName: string;
	startsAt: string;
	entryFee: string;
	winners: string;
	pot: string;
	awardLabel: string;
	bountyKind: string;
	sponsor: string;
	prize: string;
	itemLabel: string;
}

const SomewhereOnEarth = 'a far-off region';
const MoneyPrizes: PrizeKind[] = ['money', 'brand_credit'];

export function wordsFrom(activity: WorldActivity): PayloadWords {
	const text = (key: string) => (typeof activity.payload[key] === 'string' ? (activity.payload[key] as string) : null);
	const amount = (key: string) => Number(activity.payload[key] ?? 0);
	return {
		fishName: text('fishName') ?? 'a fish',
		weight: formatWeight(amount('weightLb')),
		price: formatMoney(amount('price')),
		region: regionLabelFor(text('region') ?? activity.region),
		scope: capitalised(text('scope') ?? 'lake'),
		islandName: text('islandName') ?? 'an island',
		anglerName: text('anglerName'),
		cause: text('cause'),
		ageYears: amount('ageYears'),
		heirName: text('heirName') ?? 'an heir',
		placeInTheLine: placeInTheLine(amount('generation') || 1),
		matchTitle: text('matchTitle') ?? 'A match',
		hostName: text('hostName') ?? 'somebody',
		startsAt: text('startsAt') ? formatWhen(text('startsAt') as string) : 'soon',
		entryFee: formatMoney(amount('entryFee')),
		winners: text('winners') ?? 'nobody',
		pot: formatMoney(amount('pot')),
		awardLabel: text('awardLabel') ?? 'an award',
		bountyKind: bountyKindWords(text('bountyKind')),
		sponsor: sponsorWords(text('sponsor')),
		prize: prizeWords(text('prizeKind'), amount('prizeMoney')),
		itemLabel: text('itemId') ?? 'a prototype'
	};
}

function regionLabelFor(region: string | RegionCode | null) {
	if (region && isRegionCode(region)) return RegionCatalogue[region].label;
	return SomewhereOnEarth;
}

function capitalised(word: string) {
	return word.replace(/^\w/, (letter) => letter.toUpperCase());
}

function bountyKindWords(kind: string | null) {
	return isBountyKind(kind) ? BountyKindCatalogue[kind].label.toLowerCase() : 'a bounty';
}

function sponsorWords(sponsor: string | null) {
	if (sponsor && sponsor in BrandCatalogue) return BrandCatalogue[sponsor as BrandName].label;
	return sponsor ?? 'a sponsor';
}

function prizeWords(kind: string | null, money: number) {
	if (!kind || !(kind in PrizeWords)) return formatMoney(money);
	const prizeKind = kind as PrizeKind;
	return MoneyPrizes.includes(prizeKind) ? `${formatMoney(money)} ${PrizeWords[prizeKind]}` : PrizeWords[prizeKind];
}
