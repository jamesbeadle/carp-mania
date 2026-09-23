import { CarpWeight } from '../carpGrowth';
import { ClassicFishery } from '../economy';
import { ClassicPlotAcres, classicLayoutWithSwimTerrain, type ClassicSwimTerrain } from '../layout/classicLayout';
import { waterAcres } from '../layout/waterArea';
import { carpNameForIndex } from '../naming/carpNames';
import { randomBetween, type RandomFraction } from '../random';
import { ReputationScale } from '../reputation';
import { pickStrain } from '../strains';
import type { Carp, Lake, Swim } from '../types';
import { untendedWater } from './untendedWater';
import { colourFromSilt, transparencyFromSiltAndWeed } from '../waterQuality';

const ClassicWater = { Silt: 25, Weed: 30, BankTidiness: 60, Fertility: 50 } as const;

export const ClassicSwims: ClassicSwimTerrain[] = [
	{ name: 'The Point', position: { x: 0.18, y: 0.22 }, bed: 'gravel', depthFeet: 6, feature: 'open_water' },
	{ name: 'Reeds', position: { x: 0.08, y: 0.55 }, bed: 'silt', depthFeet: 4, feature: 'reed_line' },
	{ name: 'Snag Bay', position: { x: 0.3, y: 0.84 }, bed: 'clay', depthFeet: 8, feature: 'snag' },
	{ name: 'Island Margin', position: { x: 0.62, y: 0.3 }, bed: 'gravel', depthFeet: 5, feature: 'island_margin' },
	{ name: 'Weedy Corner', position: { x: 0.86, y: 0.7 }, bed: 'silt', depthFeet: 7, feature: 'weed_bed' },
	{ name: 'Dam Wall', position: { x: 0.92, y: 0.35 }, bed: 'clay', depthFeet: 12, feature: 'open_water' },
	{ name: 'Car Park Swim', position: { x: 0.5, y: 0.92 }, bed: 'gravel', depthFeet: 9, feature: 'open_water' }
];

export function classicLake(ownerId: string, name: string, now: Date): Omit<Lake, 'id'> {
	const layout = classicLayoutWithSwimTerrain(ClassicSwims);
	return {
		owner_id: ownerId,
		name,
		acres: waterAcres(layout, ClassicPlotAcres),
		silt: ClassicWater.Silt,
		weed: ClassicWater.Weed,
		transparency: transparencyFromSiltAndWeed(ClassicWater.Silt, ClassicWater.Weed),
		water_colour: colourFromSilt(ClassicWater.Silt),
		bank_tidiness: ClassicWater.BankTidiness,
		day_ticket_fee: ClassicFishery.DayTicketFee,
		reputation: ReputationScale.Starter,
		...untendedWater(),
		is_public: true,
		simulated_until: now.toISOString(),
		opened_at: null,
		region: 'uk_ireland',
		latitude: null,
		longitude: null,
		site_type: 'classic',
		plot_acres: ClassicPlotAcres,
		layout,
		fertility: ClassicWater.Fertility,
		disturbance: 0,
		is_setup_complete: true
	};
}

export function classicCarp(lakeId: string, random: RandomFraction): Omit<Carp, 'id'>[] {
	return Array.from({ length: ClassicFishery.CarpCount }, (_, index) => ({
		lake_id: lakeId,
		name: carpNameForIndex(index),
		strain: pickStrain(random(), 'uk_ireland'),
		weight_lb: roundToQuarterPound(randomBetween(random, CarpWeight.StarterMinimumLb, CarpWeight.StarterMaximumLb)),
		age_years: Math.round(randomBetween(random, 4, 9)),
		condition: Math.round(randomBetween(random, 55, 90)),
		times_caught: 0,
		origin: 'classic',
		origin_lake_id: lakeId,
		fame: 0,
		is_catalogued: true,
		transit_until: null,
		quarantine_until: null
	}));
}

export function classicSwims(lakeId: string): Omit<Swim, 'id'>[] {
	return ClassicSwims.map((swim) => ({ lake_id: lakeId, name: swim.name, position_x: swim.position.x, position_y: swim.position.y }));
}

function roundToQuarterPound(value: number) {
	return Math.round(value * 4) / 4;
}
