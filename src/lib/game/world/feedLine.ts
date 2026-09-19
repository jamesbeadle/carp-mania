import type { WorldActivity } from '$lib/contracts/WorldActivity';
import { isByAnAngler } from '$lib/domain/world/feedGroups';
import type { WorldEventKind } from '$lib/domain/worldTypes';
import { wordsFrom, type PayloadWords } from './feedWords';

export const FeedGlyph: Record<WorldEventKind, string> = {
	big_catch: '✦', sale: '⇢', new_water: '✚', record: '⚑', island_built: '🏝', fish_died: '✝', handover: '⚘', match_announced: '⚔', match_won: '🏆',
	award: '★', bounty_posted: '£', bounty_won: '£', prototype_lost: '✗'
};


const Writers: Record<WorldEventKind, (activity: WorldActivity, words: PayloadWords) => string> = {
	big_catch: (activity, words) => `${words.fishName} at ${words.weight}, ${activity.lakeName}${anglerWords(activity, words)}`,
	sale: (activity, words) => `${words.fishName} sold for ${words.price} → ${activity.otherLakeName ?? 'a new home'}`,
	new_water: (activity, words) => `New water opened in ${words.region}: ${activity.lakeName}`,
	record: (activity, words) => `${words.scope} record: ${words.fishName} ${words.weight} at ${activity.lakeName}${anglerWords(activity, words)}`,
	island_built: (activity, words) => `${activity.lakeName} built ${words.islandName}`,
	fish_died: (activity, words) => `${words.fishName} (${words.weight}) has died at ${activity.lakeName}${words.cause === 'pike' ? ' — the pike had it' : ` — old age, at ${words.ageYears}`}`,
	handover: (activity, words) => `${activity.lakeName} passes to ${words.heirName}, ${words.placeInTheLine}`,
	match_announced: (activity, words) => `${words.matchTitle} at ${activity.lakeName} — ${words.hostName} is hosting, ${words.startsAt}, ${words.entryFee} to enter`,
	match_won: (activity, words) => `${words.matchTitle} at ${activity.lakeName} went to ${words.winners}, ${words.pot} in prizes`,
	award: (activity, words) => `${words.anglerName ?? 'An angler'} won the ${words.awardLabel} award`,
	bounty_posted: (activity, words) => `${words.sponsor} has put ${words.prize} on ${activity.lakeName} — ${words.bountyKind}`,
	bounty_won: (activity, words) => `${words.anglerName ?? 'An angler'} took the ${words.bountyKind} bounty at ${activity.lakeName}: ${words.prize}`,
	prototype_lost: (activity, words) => `${words.itemLabel} snapped in ${words.anglerName ?? 'an angler'}'s hands — struck from the board`
};

function anglerWords(activity: WorldActivity, words: PayloadWords) {
	if (!words.anglerName) return '';
	return isByAnAngler(activity) ? ` — ${words.anglerName}` : ` — ${words.anglerName}, a visitor`;
}

export function feedLineFor(activity: WorldActivity): string {
	return `${FeedGlyph[activity.kind]} ${Writers[activity.kind](activity, wordsFrom(activity))}`;
}

