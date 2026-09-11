import type { RodSetup } from './tackle/rodSetup';

export type BedType = 'gravel' | 'clay' | 'silt';
export type SwimFeature = 'open_water' | 'weed_bed' | 'snag' | 'island_margin' | 'reed_line';
export type CarpStrain = 'common' | 'mirror' | 'linear' | 'leather' | 'ghost';
export type FeedType = 'fishmeal_boilies' | 'hemp' | 'maize' | 'particles' | 'worms' | 'shrimp';

export interface Profile {
	id: string;
	display_name: string;
	avatar_url: string | null;
	money: number;
	line_selection: number;
	rig_selection: number;
	bait_selection: number;
	watercraft: number;
	experience: number;
	saved_rods: RodSetup[];
}

export interface Lake {
	id: string;
	owner_id: string;
	name: string;
	acres: number;
	water_colour: number;
	transparency: number;
	weed: number;
	silt: number;
	bank_tidiness: number;
	day_ticket_fee: number;
	reputation: number;
	has_bailiff: boolean;
	pike_count: number;
	pike_food: number;
	feed_stock: Record<FeedType, number>;
	is_public: boolean;
	simulated_until: string;
}

export interface Swim {
	id: string;
	lake_id: string;
	name: string;
	position_x: number;
	position_y: number;
	bed_type: BedType;
	depth_feet: number;
	feature: SwimFeature;
}

export interface Carp {
	id: string;
	lake_id: string;
	name: string;
	strain: CarpStrain;
	weight_lb: number;
	age_years: number;
	condition: number;
	times_caught: number;
}

export interface Catch {
	id: string;
	lake_id: string;
	carp_id: string;
	angler_id: string | null;
	angler_name: string;
	weight_lb: number;
	swim_name: string;
	rig: string;
	bait: string;
	hook_size: number;
	caught_at: string;
}

export interface LakeVisit {
	id: string;
	lake_id: string;
	angler_id: string | null;
	angler_name: string;
	fee_paid: number;
	fish_caught: number;
	visited_at: string;
}
