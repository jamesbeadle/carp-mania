import type { BestAnglerEntry, BiggestAliveEntry, BiggestEverEntry, Leaderboards, TopReputationEntry } from '$lib/contracts/Leaderboards';
import { formatWhen } from '$lib/format/dates';
import { formatWeight } from '$lib/format/weight';

export interface LeaderboardRow {
	key: string;
	label: string;
	detail: string;
	value: string;
	href: string | null;
}

export interface LeaderboardBoard {
	title: string;
	rows: LeaderboardRow[];
}

export function boardsFrom(leaderboards: Leaderboards): LeaderboardBoard[] {
	return [
		{ title: 'Biggest fish alive', rows: leaderboards.biggestAlive.map(biggestAliveRow) },
		{ title: 'Biggest ever caught', rows: leaderboards.biggestEver.map(biggestEverRow) },
		{ title: 'Top reputation', rows: leaderboards.topReputation.map(topReputationRow) },
		{ title: 'Best anglers', rows: leaderboards.bestAnglers.map(bestAnglerRow) }
	];
}

function biggestAliveRow(entry: BiggestAliveEntry): LeaderboardRow {
	return { key: entry.carpId, label: entry.name, detail: entry.lakeName, value: formatWeight(entry.weightLb), href: `/carp/${entry.carpId}` };
}

function biggestEverRow(entry: BiggestEverEntry): LeaderboardRow {
	return { key: entry.catchId, label: entry.anglerName, detail: `${entry.lakeName} · ${formatWhen(entry.caughtAt)}`, value: formatWeight(entry.weightLb), href: null };
}

function topReputationRow(entry: TopReputationEntry): LeaderboardRow {
	return { key: entry.lakeId, label: entry.name, detail: `${entry.ownerName}'s water`, value: String(Math.round(entry.reputation)), href: `/lakes/${entry.lakeId}` };
}

function bestAnglerRow(entry: BestAnglerEntry): LeaderboardRow {
	return { key: entry.profileId, label: entry.displayName, detail: 'overall skill', value: String(Math.round(entry.overallSkill)), href: `/anglers/${entry.profileId}` };
}
