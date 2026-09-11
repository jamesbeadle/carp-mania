import type { SkillName } from '$lib/domain/anglerSkills';
import type { CarpStrain, Catch, Lake, Profile } from '$lib/domain/types';

export type PublicAngler = Pick<Profile, 'id' | 'display_name' | 'avatar_url' | 'experience' | SkillName>;

export type AnglerWater = Pick<Lake, 'id' | 'name' | 'region' | 'acres' | 'reputation' | 'day_ticket_fee'>;

export interface FamousFish {
	id: string;
	name: string;
	strain: CarpStrain;
	weightLb: number;
	fame: number;
	lakeId: string;
	lakeName: string;
}

export interface AnglerPublicProfile {
	profile: PublicAngler;
	overallSkill: number;
	water: AnglerWater | null;
	personalBests: Catch[];
	recentCatches: Catch[];
	famousFish: FamousFish[];
	carpNames: Record<string, string>;
	lakeNames: Record<string, string>;
	isViewer: boolean;
}
