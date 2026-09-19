import type { SkillName } from '$lib/domain/anglerSkills';
import type { AnglerFilters } from '$lib/domain/lists/anglerFilters';
import type { ListPage } from '$lib/domain/lists/paging';
import type { Lake, Profile } from '$lib/domain/types';

export type AnglerSkills = Pick<Profile, SkillName>;

export type NamedWater = Pick<Lake, 'id' | 'name'>;

export interface AnglerDirectoryEntry {
	id: string;
	displayName: string;
	avatarUrl: string | null;
	skills: AnglerSkills;
	rating: number;
	personalBestLb: number;
	totalCatches: number;
	water: NamedWater | null;
}

export interface AnglerDirectory {
	page: ListPage<AnglerDirectoryEntry>;
	filters: AnglerFilters;
}
