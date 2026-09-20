import type { LakeLayout } from './layout/layoutTypes';
import type { Tier } from './tackle/brands';
import type { RodSetup } from './tackle/rodSetup';
import type { RegionCode } from './world/regionCodes';

export type BedType = 'gravel' | 'clay' | 'silt' | 'rock';
export type SwimFeature = 'open_water' | 'weed_bed' | 'snag' | 'island_margin' | 'reed_line' | 'gravel_bar' | 'lily_pads';
export type CarpStrain = 'common' | 'mirror' | 'linear' | 'leather' | 'ghost' | 'fully_scaled';
export type CarpOrigin = 'farm' | 'wild' | 'bred' | 'classic';
export type FeedType = 'fishmeal_boilies' | 'hemp' | 'maize' | 'particles' | 'worms' | 'shrimp';
export type SiteType = 'gravel_pit' | 'quarry' | 'clay_pit' | 'estate_lake' | 'farm_pond' | 'greenfield' | 'classic';

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
	home_region: RegionCode | null;
	plot_region: RegionCode | null;
	plot_latitude: number | null;
	plot_longitude: number | null;
	current_lake_id: string | null;
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
	region: RegionCode;
	latitude: number | null;
	longitude: number | null;
	site_type: SiteType;
	plot_acres: number;
	layout: LakeLayout;
	fertility: number;
	disturbance: number;
	is_setup_complete: boolean;
	shop_tier: Tier;
	is_barbed_banned: boolean;
	is_booking_on: boolean;
	syndicate_places_for_sale: number;
	syndicate_price: number;
}

export interface Swim {
	id: string;
	lake_id: string;
	name: string;
	position_x: number;
	position_y: number;
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
	origin: CarpOrigin;
	origin_lake_id: string | null;
	fame: number;
	is_catalogued: boolean;
	transit_until: string | null;
	quarantine_until: string | null;
}

export type { Catch, LakeVisit } from './historyTypes';
