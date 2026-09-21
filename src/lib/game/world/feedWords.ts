import type { WorldActivity } from '$lib/contracts/WorldActivity';
import { placeInTheLine } from '$lib/domain/legacy/diary';
import { isRegionCode, type RegionCode } from '$lib/domain/world/regionCodes';
import { RegionCatalogue } from '$lib/domain/world/regions';
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
	awardLabel: string;
	itemLabel: string;
}

const SomewhereOnEarth = 'a far-off region';

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
		awardLabel: text('awardLabel') ?? 'an award',
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
