import { CarpWeight } from './carpGrowth';
import { StarterFishery } from './economy';
import { emptyFeedStock } from './feed';
import { carpNameForIndex } from './naming/carpNames';
import { randomBetween, type RandomFraction } from './random';
import { ReputationScale } from './reputation';
import { pickStrain } from './strains';
import type { Carp, Lake, Swim } from './types';
import { colourFromSilt, transparencyFromSiltAndWeed } from './waterQuality';

const StarterWater = { Silt: 25, Weed: 30, BankTidiness: 60 } as const;

export function starterLake(ownerId: string, name: string, now: Date): Omit<Lake, 'id'> {
	return {
		owner_id: ownerId,
		name,
		acres: StarterFishery.Acres,
		silt: StarterWater.Silt,
		weed: StarterWater.Weed,
		transparency: transparencyFromSiltAndWeed(StarterWater.Silt, StarterWater.Weed),
		water_colour: colourFromSilt(StarterWater.Silt),
		bank_tidiness: StarterWater.BankTidiness,
		day_ticket_fee: StarterFishery.DayTicketFee,
		reputation: ReputationScale.Starter,
		has_bailiff: false,
		pike_count: 0,
		pike_food: 0,
		feed_stock: emptyFeedStock(),
		is_public: true,
		simulated_until: now.toISOString()
	};
}

export function starterCarp(lakeId: string, random: RandomFraction): Omit<Carp, 'id'>[] {
	return Array.from({ length: StarterFishery.CarpCount }, (_, index) => ({
		lake_id: lakeId,
		name: carpNameForIndex(index),
		strain: pickStrain(random()),
		weight_lb: roundToQuarterPound(randomBetween(random, CarpWeight.StarterMinimumLb, CarpWeight.StarterMaximumLb)),
		age_years: Math.round(randomBetween(random, 4, 9)),
		condition: Math.round(randomBetween(random, 55, 90)),
		times_caught: 0
	}));
}

export const StarterSwims: Omit<Swim, 'id' | 'lake_id'>[] = [
	{ name: 'The Point', position_x: 0.18, position_y: 0.22, bed_type: 'gravel', depth_feet: 6, feature: 'open_water' },
	{ name: 'Reeds', position_x: 0.08, position_y: 0.55, bed_type: 'silt', depth_feet: 4, feature: 'reed_line' },
	{ name: 'Snag Bay', position_x: 0.3, position_y: 0.84, bed_type: 'clay', depth_feet: 8, feature: 'snag' },
	{ name: 'Island Margin', position_x: 0.62, position_y: 0.3, bed_type: 'gravel', depth_feet: 5, feature: 'island_margin' },
	{ name: 'Weedy Corner', position_x: 0.86, position_y: 0.7, bed_type: 'silt', depth_feet: 7, feature: 'weed_bed' },
	{ name: 'Dam Wall', position_x: 0.92, position_y: 0.35, bed_type: 'clay', depth_feet: 12, feature: 'open_water' },
	{ name: 'Car Park Swim', position_x: 0.5, position_y: 0.92, bed_type: 'gravel', depth_feet: 9, feature: 'open_water' }
];

export function starterSwims(lakeId: string): Omit<Swim, 'id'>[] {
	return StarterSwims.map((swim) => ({ ...swim, lake_id: lakeId }));
}

function roundToQuarterPound(value: number) {
	return Math.round(value * 4) / 4;
}
