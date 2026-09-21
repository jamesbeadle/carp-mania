import type { WorldActivity } from '../../contracts/WorldActivity';
import type { WorldEventKind } from '../worldTypes';

export type FeedGroup = 'anglers' | 'catches' | 'market' | 'waters' | 'lines';

export interface FeedGroupChoice {
	group: FeedGroup;
	label: string;
	kinds: WorldEventKind[];
}

export const AnglersGroup: FeedGroup = 'anglers';
export const AnglersDoings: WorldEventKind[] = ['handover', 'award', 'prototype_lost'];

export const FeedGroups: FeedGroupChoice[] = [
	{ group: AnglersGroup, label: 'Anglers', kinds: [] },
	{ group: 'catches', label: 'Catches', kinds: ['big_catch', 'record'] },
	{ group: 'market', label: 'Sales', kinds: ['sale'] },
	{ group: 'waters', label: 'Waters', kinds: ['new_water', 'island_built'] },
	{ group: 'lines', label: 'Lives', kinds: ['fish_died', 'handover'] }
];

export const FeedWindow = { PageSize: 30, LongestBefore: 40 } as const;

export function feedGroupFrom(param: string | null): FeedGroup | null {
	const choice = FeedGroups.find((candidate) => candidate.group === param);
	return choice ? choice.group : null;
}

export function kindsInGroup(group: FeedGroup | null): WorldEventKind[] | null {
	if (group === null || group === AnglersGroup) return null;
	return FeedGroups.find((choice) => choice.group === group)?.kinds ?? null;
}

export function isByAnAngler(activity: Pick<WorldActivity, 'kind' | 'payload'>) {
	return typeof activity.payload.anglerId === 'string' || AnglersDoings.includes(activity.kind);
}

export function isAVisitorsCatch(activity: Pick<WorldActivity, 'kind' | 'payload'>) {
	return activity.kind === 'big_catch' && !isByAnAngler(activity);
}

export function isActivityInGroup(activity: WorldActivity, group: FeedGroup | null) {
	if (group === AnglersGroup) return isByAnAngler(activity);
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
