import type { SkillName } from '$lib/domain/anglerSkills';
import type { ListPage } from '$lib/domain/lists/paging';
import type { CarpStrain, Catch, Lake, Profile } from '$lib/domain/types';
import type { MeasureUp, TrophyRoom } from './TrophyRoom';

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

export interface PlaceInTheLine {
	generation: number;
	age: number;
}

export interface AnglerPublicProfile {
	profile: PublicAngler;
	line: PlaceInTheLine | null;
	rating: number;
	waters: AnglerWater[];
	recentCatches: ListPage<Catch>;
	famousFish: FamousFish[];
	carpNames: Record<string, string>;
	lakeNames: Record<string, string>;
	trophyRoom: TrophyRoom;
	measureUp: MeasureUp | null;
	isViewer: boolean;
}
