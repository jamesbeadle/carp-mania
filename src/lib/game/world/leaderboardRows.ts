import type { BestAnglerEntry, BiggestAliveEntry, BiggestEverEntry, Leaderboards, TopReputationEntry } from '$lib/contracts/Leaderboards';
import { formatWhen } from '$lib/format/dates';
import { formatWeight } from '$lib/format/weight';

export interface LeaderboardRow {
	key: string;
	label: string;
	detail: string;
	value: string;
	href: string | null;
	isViewers: boolean;
}

export interface LeaderboardBoard {
	title: string;
	rows: LeaderboardRow[];
}

export function boardsFrom(leaderboards: Leaderboards, viewerId: string | null): LeaderboardBoard[] {
	return [
		{ title: 'Biggest fish alive', rows: leaderboards.biggestAlive.map(biggestAliveRow) },
		{ title: 'Biggest by an angler', rows: leaderboards.biggestEver.map((entry) => biggestEverRow(entry, viewerId)) },
		{ title: 'Top reputation', rows: leaderboards.topReputation.map(topReputationRow) },
		{ title: 'Best anglers', rows: leaderboards.bestAnglers.map((entry) => bestAnglerRow(entry, viewerId)) }
	];
}

function biggestAliveRow(entry: BiggestAliveEntry): LeaderboardRow {
	return { key: entry.carpId, label: entry.name, detail: entry.lakeName, value: formatWeight(entry.weightLb), href: `/carp/${entry.carpId}`, isViewers: false };
}

function biggestEverRow(entry: BiggestEverEntry, viewerId: string | null): LeaderboardRow {
	const href = entry.anglerId ? `/anglers/${entry.anglerId}` : null;
	return { key: entry.catchId, label: entry.anglerName, detail: `${entry.lakeName} · ${formatWhen(entry.caughtAt)}`, value: formatWeight(entry.weightLb), href, isViewers: entry.anglerId === viewerId };
}

function topReputationRow(entry: TopReputationEntry): LeaderboardRow {
	return { key: entry.lakeId, label: entry.name, detail: `${entry.ownerName}'s water`, value: String(Math.round(entry.reputation)), href: `/lakes/${entry.lakeId}`, isViewers: false };
}

function bestAnglerRow(entry: BestAnglerEntry, viewerId: string | null): LeaderboardRow {
	return { key: entry.profileId, label: entry.displayName, detail: 'rating', value: String(Math.round(entry.rating)), href: `/anglers/${entry.profileId}`, isViewers: entry.profileId === viewerId };
}
