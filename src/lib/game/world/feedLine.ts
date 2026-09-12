import type { WorldActivity } from '$lib/contracts/WorldActivity';
import { isRegionCode, type RegionCode } from '$lib/domain/world/regionCodes';
import { RegionCatalogue } from '$lib/domain/world/regions';
import type { WorldEventKind } from '$lib/domain/worldTypes';
import { formatMoney } from '$lib/format/money';
import { formatWeight } from '$lib/format/weight';

export const FeedGlyph: Record<WorldEventKind, string> = { big_catch: '✦', sale: '⇢', new_water: '✚', record: '⚑', island_built: '🏝', fish_died: '✝' };

interface PayloadWords {
	fishName: string;
	weight: string;
	price: string;
	region: string;
	scope: string;
	islandName: string;
	anglerName: string | null;
	cause: string | null;
	ageYears: number;
}

const SomewhereOnEarth = 'a far-off region';

const Writers: Record<WorldEventKind, (activity: WorldActivity, words: PayloadWords) => string> = {
	big_catch: (activity, words) => `${words.fishName} at ${words.weight}, ${activity.lakeName}${words.anglerName ? ` — ${words.anglerName}` : ''}`,
	sale: (activity, words) => `${words.fishName} sold for ${words.price} → ${activity.otherLakeName ?? 'a new home'}`,
	new_water: (activity, words) => `New water opened in ${words.region}: ${activity.lakeName}`,
	record: (activity, words) => `${words.scope} record: ${words.fishName} ${words.weight} at ${activity.lakeName}`,
	island_built: (activity, words) => `${activity.lakeName} built ${words.islandName}`,
	fish_died: (activity, words) => `${words.fishName} (${words.weight}) has died at ${activity.lakeName}${words.cause === 'pike' ? ' — the pike had it' : ` — old age, at ${words.ageYears}`}`
};

export function feedLineFor(activity: WorldActivity): string {
	return `${FeedGlyph[activity.kind]} ${Writers[activity.kind](activity, wordsFrom(activity))}`;
}

function wordsFrom(activity: WorldActivity): PayloadWords {
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
		ageYears: amount('ageYears')
	};
}

function regionLabelFor(region: string | RegionCode | null) {
	if (region && isRegionCode(region)) return RegionCatalogue[region].label;
	return SomewhereOnEarth;
}

function capitalised(word: string) {
	return word.replace(/^\w/, (letter) => letter.toUpperCase());
}
