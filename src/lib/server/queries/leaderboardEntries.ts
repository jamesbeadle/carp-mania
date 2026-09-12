import type { BestAnglerEntry, BiggestAliveEntry, BiggestEverEntry, TopReputationEntry } from '$lib/contracts/Leaderboards';

const UnknownOwner = 'Unknown owner';
const UnknownWater = 'An unknown water';

export interface LakeNameEmbed {
	name: string;
}

export interface BiggestAliveRow {
	id: string;
	name: string;
	weight_lb: number;
	lake_id: string;
	lakes: LakeNameEmbed | null;
}

export interface BiggestEverRow {
	id: string;
	weight_lb: number;
	angler_name: string;
	caught_at: string;
	lakes: LakeNameEmbed | null;
}

export interface TopReputationRow {
	id: string;
	name: string;
	reputation: number;
	profiles: { display_name: string } | null;
}

export interface BestAnglerRow {
	id: string;
	display_name: string;
	overall_skill: number;
}

export function biggestAliveEntry(row: BiggestAliveRow): BiggestAliveEntry {
	return { carpId: row.id, name: row.name, weightLb: Number(row.weight_lb), lakeId: row.lake_id, lakeName: row.lakes?.name ?? UnknownWater };
}

export function biggestEverEntry(row: BiggestEverRow): BiggestEverEntry {
	return { catchId: row.id, weightLb: Number(row.weight_lb), anglerName: row.angler_name, lakeName: row.lakes?.name ?? UnknownWater, caughtAt: row.caught_at };
}

export function topReputationEntry(row: TopReputationRow): TopReputationEntry {
	return { lakeId: row.id, name: row.name, reputation: Number(row.reputation), ownerName: row.profiles?.display_name ?? UnknownOwner };
}

export function bestAnglerEntry(row: BestAnglerRow): BestAnglerEntry {
	return { profileId: row.id, displayName: row.display_name, overallSkill: Number(row.overall_skill) };
}
