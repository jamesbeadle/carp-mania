import type { BedType, SiteType } from '../types';
import { landPriceFor } from '../world/regions';
import type { RegionCode } from '../world/regionCodes';

export interface StartingStockRule {
	minimumCount: number;
	maximumCount: number;
	minimumLb: number;
	maximumLb: number;
	isCatalogued: boolean;
	origin: 'wild' | 'farm';
}

export interface SiteProfile {
	label: string;
	blurb: string;
	problem: string;
	basePrice: number;
	digPricePerAcre: number;
	inletPrice: number;
	fixedPlotAcres: number | null;
	water: { silt: number; weed: number; bankTidiness: number };
	baseBed: BedType;
	baseDepthFeet: number;
	startingReputation: number;
	startingFertility: number;
	stock: StartingStockRule[];
	namedThirties: string[];
	historyDays: number;
	isOffered: boolean;
}

export const PlotSizes = [5, 10, 15, 20] as const;
export const GreenfieldWaterShareOfPlot = 0.6;

export const SiteCatalogue: Record<SiteType, SiteProfile> = {
	gravel_pit: { label: 'Old gravel pit', blurb: 'Clear water over gravel bars and two islands left by the workings. A few old fish nobody has catalogued.', problem: 'Sparse — it needs stocking, and clear water shows every line.', basePrice: 14000, digPricePerAcre: 0, inletPrice: 0, fixedPlotAcres: null, water: { silt: 10, weed: 25, bankTidiness: 55 }, baseBed: 'gravel', baseDepthFeet: 9, startingReputation: 10, startingFertility: 45, stock: [{ minimumCount: 4, maximumCount: 8, minimumLb: 18, maximumLb: 34, isCatalogued: false, origin: 'wild' }], namedThirties: [], historyDays: 0, isOffered: true },
	quarry: { label: 'Disused quarry', blurb: 'Crystal clear, cold and thirty feet deep, with sheer rock sides and nothing living in it yet.', problem: 'Unfishable until margin shelves and bars are cut; fish grow slowly until fed hard.', basePrice: 8000, digPricePerAcre: 0, inletPrice: 0, fixedPlotAcres: null, water: { silt: 0, weed: 5, bankTidiness: 40 }, baseBed: 'rock', baseDepthFeet: 30, startingReputation: 5, startingFertility: 12, stock: [], namedThirties: [], historyDays: 0, isOffered: true },
	clay_pit: { label: 'Flooded clay pit', blurb: 'Coloured, fertile water over clay from the old brickworks, with a score of wild commons in it.', problem: 'Coloured for ever — a bailiff can only take it so far.', basePrice: 11000, digPricePerAcre: 0, inletPrice: 0, fixedPlotAcres: null, water: { silt: 45, weed: 20, bankTidiness: 50 }, baseBed: 'clay', baseDepthFeet: 8, startingReputation: 15, startingFertility: 70, stock: [{ minimumCount: 20, maximumCount: 20, minimumLb: 8, maximumLb: 16, isCatalogued: false, origin: 'wild' }], namedThirties: [], historyDays: 0, isOffered: true },
	estate_lake: { label: 'Estate lake', blurb: 'A mature water with reed lines, lily pads, an old dam, sixty known fish and two named thirties.', problem: 'Needs dredging and a bailiff; weed chokes it in summer; shallow, so heatwaves bite.', basePrice: 22000, digPricePerAcre: 0, inletPrice: 0, fixedPlotAcres: null, water: { silt: 55, weed: 45, bankTidiness: 70 }, baseBed: 'silt', baseDepthFeet: 6, startingReputation: 45, startingFertility: 80, stock: [{ minimumCount: 58, maximumCount: 58, minimumLb: 12, maximumLb: 28, isCatalogued: true, origin: 'wild' }], namedThirties: ['The Big Common', 'Old Mirror'], historyDays: 90, isOffered: true },
	farm_pond: { label: 'Farm pond', blurb: 'Four acres of warm, weedy water full of small fish.', problem: 'Small — a swim cap of seven, and 400 lb an acre fills up fast.', basePrice: 3000, digPricePerAcre: 0, inletPrice: 0, fixedPlotAcres: 4, water: { silt: 40, weed: 35, bankTidiness: 60 }, baseBed: 'silt', baseDepthFeet: 4, startingReputation: 10, startingFertility: 65, stock: [{ minimumCount: 150, maximumCount: 150, minimumLb: 3, maximumLb: 6, isCatalogued: true, origin: 'farm' }], namedThirties: [], historyDays: 0, isOffered: true },
	greenfield: { label: 'Greenfield', blurb: 'A field with a spring. You draw the water; we dig it.', problem: 'Sterile for its first season, and the dearest water per acre.', basePrice: 0, digPricePerAcre: 3500, inletPrice: 2000, fixedPlotAcres: null, water: { silt: 5, weed: 0, bankTidiness: 80 }, baseBed: 'clay', baseDepthFeet: 8, startingReputation: 0, startingFertility: 10, stock: [], namedThirties: [], historyDays: 0, isOffered: true },
	classic: { label: 'Classic water', blurb: 'The original ten-acre water.', problem: 'Grandfathered only.', basePrice: 0, digPricePerAcre: 0, inletPrice: 0, fixedPlotAcres: 10, water: { silt: 25, weed: 30, bankTidiness: 60 }, baseBed: 'gravel', baseDepthFeet: 7, startingReputation: 20, startingFertility: 50, stock: [], namedThirties: [], historyDays: 0, isOffered: false }
};

export const OfferedSites = (Object.keys(SiteCatalogue) as SiteType[]).filter((site) => SiteCatalogue[site].isOffered);

export function plotAcresFor(site: SiteType, chosenAcres: number) {
	return SiteCatalogue[site].fixedPlotAcres ?? chosenAcres;
}

export function sitePriceFor(site: SiteType, region: RegionCode, plotAcres: number, waterAcresDug: number) {
	const profile = SiteCatalogue[site];
	return profile.basePrice + profile.digPricePerAcre * waterAcresDug + profile.inletPrice + landPriceFor(region, plotAcresFor(site, plotAcres));
}
