import type { SkillName } from '$lib/domain/anglerSkills';
import type { Lake, Profile } from '$lib/domain/types';

export type AnglerSkills = Pick<Profile, SkillName>;

export type NamedWater = Pick<Lake, 'id' | 'name'>;

export interface AnglerDirectoryEntry {
	id: string;
	displayName: string;
	avatarUrl: string | null;
	skills: AnglerSkills;
	overallSkill: number;
	personalBestLb: number;
	totalCatches: number;
	water: NamedWater | null;
}
