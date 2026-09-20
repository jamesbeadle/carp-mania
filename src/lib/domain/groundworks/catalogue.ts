import { Facilities, type Facility } from '../layout/layoutTypes';
import { FacilityCatalogue } from './facilities';
import type { IslandSize, WorkKind } from './workKinds';

export interface WorkProfile {
	label: string;
	blurb: string;
	disturbance: number;
}

export const GroundworksCatalogue: Record<WorkKind, WorkProfile> = {
	island: { label: 'Build an island', blurb: 'Margins to fish to and shelter for the fish. Everything within 30 ft is island margin.', disturbance: 8 },
	gravel_bar: { label: 'Gravel bar or plateau', blurb: 'A raised gravel feature at 3–5 ft. Clear-water fishing at its best.', disturbance: 0 },
	deepen: { label: 'Deepen a hole or channel', blurb: 'A 12–18 ft hole. Where the fish sit in winter.', disturbance: 6 },
	dredge: { label: 'Dredge the silt', blurb: 'Silt out, depth in. The natural food goes with the silt, mind.', disturbance: 12 },
	margin_shelf: { label: 'Cut a margin shelf', blurb: 'A 25 ft shelf along the bank at 3–5 ft. Essential on a quarry.', disturbance: 0 },
	reed_bed: { label: 'Plant a reed bed', blurb: 'Reeds along the bank. Fish hold in them and they filter the water.', disturbance: 0 },
	lily_pads: { label: 'Plant lily pads', blurb: 'A summer holding spot in water no deeper than 6 ft. Dormant in winter.', disturbance: 0 },
	snag: { label: 'Sink a snag', blurb: 'A fallen tree. Big fish hold there; one hooked fish in ten finds it.', disturbance: 0 },
	reshape_shoreline: { label: 'Reshape the shoreline', blurb: 'Drag the bank. Water you add is dug at the going rate.', disturbance: 5 },
	sanctuary: { label: 'Mark a sanctuary', blurb: 'A stretch of bank with no pegs. Costs nothing but pegs; big fish favour it.', disturbance: 0 },
	...facilityWorks()
};

function facilityWorks(): Record<Facility, WorkProfile> {
	const entries = Facilities.map((facility) => [facility, { ...FacilityCatalogue[facility], disturbance: 0 }]);
	return Object.fromEntries(entries) as Record<Facility, WorkProfile>;
}

export const IslandWorks: Record<IslandSize, { cost: number; days: number; acres: number }> = {
	small: { cost: 3500, days: 6, acres: 0.15 },
	medium: { cost: 6000, days: 10, acres: 0.4 },
	large: { cost: 9500, days: 14, acres: 0.8 }
};

export const WorkPrices = {
	GravelBar: { cost: 2200, days: 4, maximumAcres: 0.5 },
	Deepen: { cost: 2600, days: 6, maximumAcres: 0.75, minimumDepthFeet: 12, maximumDepthFeet: 18 },
	Dredge: { costPerAcre: 1800, daysPerAcre: 5, siltCleared: 25, fertilityLost: 10, depthGainedFeet: 3 },
	MarginShelf: { costPerHundredFeet: 1400, daysPerHundredFeet: 3, widthFeet: 25, depthFeet: 4 },
	ReedBed: { costPerFiftyFeet: 400, days: 2, weedGained: 1 },
	LilyPads: { cost: 600, days: 3, maximumAcres: 0.25, maximumDepthFeet: 6 },
	Snag: { cost: 700, days: 1, minimumFeetFromBank: 30 },
	Shoreline: { costPerHundredFeetMoved: 900, daysPerHundredFeetMoved: 3, digCostPerAcreAdded: 3500, digDaysPerAcreAdded: 8, disturbancePerAcreAdded: 10 },
	Sanctuary: { cost: 0, days: 1, pegFreeFeet: 60 },
	BarDepth: { minimumFeet: 3, maximumFeet: 5 }
} as const;

export const WorksInProgress = { MaximumEarthworks: 3, CancelRefundShare: 0.5, CancelWithinFisheryDays: 1 } as const;

export const IslandRules = { MinimumFeetFromBank: 40, MaximumShareOfWater: 0.25, MinimumWaterAcres: 1 } as const;

export function islandCapFor(waterAcres: number) {
	return Math.floor(waterAcres / 3) + 1;
}
