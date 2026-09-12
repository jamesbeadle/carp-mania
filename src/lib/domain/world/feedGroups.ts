import type { WorldActivity } from '../../contracts/WorldActivity';
import type { WorldEventKind } from '../worldTypes';

export type FeedGroup = 'catches' | 'market' | 'waters' | 'matches' | 'lines';

export interface FeedGroupChoice {
	group: FeedGroup;
	label: string;
	kinds: WorldEventKind[];
}

export const FeedGroups: FeedGroupChoice[] = [
	{ group: 'catches', label: 'Catches', kinds: ['big_catch', 'record'] },
	{ group: 'market', label: 'Sales', kinds: ['sale'] },
	{ group: 'waters', label: 'Waters', kinds: ['new_water', 'island_built'] },
	{ group: 'matches', label: 'Matches', kinds: ['match_announced', 'match_won'] },
	{ group: 'lines', label: 'Lives', kinds: ['fish_died', 'handover'] }
];

export const FeedWindow = { PageSize: 30, LongestBefore: 40 } as const;

export function feedGroupFrom(param: string | null): FeedGroup | null {
	const choice = FeedGroups.find((candidate) => candidate.group === param);
	return choice ? choice.group : null;
}

export function kindsInGroup(group: FeedGroup | null): WorldEventKind[] | null {
	if (group === null) return null;
	return FeedGroups.find((choice) => choice.group === group)?.kinds ?? null;
}

export function isActivityInGroup(activity: WorldActivity, group: FeedGroup | null) {
	const kinds = kindsInGroup(group);
	return kinds === null || kinds.includes(activity.kind);
}

export function oldestOf(feed: WorldActivity[]): WorldActivity | null {
	return feed.reduce<WorldActivity | null>((oldest, activity) => (oldest === null || activity.createdAt < oldest.createdAt ? activity : oldest), null);
}

export function olderFeedPathFor(before: string, group: FeedGroup | null) {
	const search = new URLSearchParams({ before });
	if (group) search.set('group', group);
	return `/world/feed?${search.toString()}`;
}
