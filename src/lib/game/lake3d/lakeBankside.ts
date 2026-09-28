import { Group } from 'three';
import type { LakeLayout, LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { createFacilities } from './bank/facilities3d';
import { plotFacilities } from './bank/facilityGrounds';
import { createLakeFeatures, reedLinesOf } from './bank/lakeFeatures3d';
import { worldPointOf, type LakeFrame, type WorldPoint } from './lakeFrame';
import { headingOverTheWater, podSpotFacing } from './swimFacing';
import type { Country } from './terrain/lakeLand';
import { plantTrees } from './trees/treePlanting';
import { Vegetation } from './vegetation';

export interface BankSite {
	frame: LakeFrame;
	outline: WorldPoint[];
	islands: WorldPoint[][];
	groundAt: (point: WorldPoint) => number;
}

export interface BanksidePlan {
	layout: LakeLayout;
	pegs: LayoutPoint[];
	season: SeasonName;
	seed: number;
	plotReach: number;
	plotEdge: WorldPoint | null;
	country: Country | null;
}

const Clearing = { Trees: 10, Platform: 2.2, Pod: 1.6 } as const;

export function createBankside(site: BankSite, plan: BanksidePlan) {
	const { frame, outline, islands, groundAt } = site;
	const { layout, season, seed, plotEdge, country } = plan;
	const wholePlot = { x: frame.metresAcross / 2, z: frame.metresDown / 2 };
	const pegs = plan.pegs.map((peg) => worldPointOf(frame, peg));
	const plots = plotFacilities(layout, site, pegs, wholePlot);
	const facilities = createFacilities(plots, groundAt);
	const buildings = plots.map((plot) => ({ point: plot.point, radius: plot.footprintMetres / 2 }));
	const keepClear = [...pegs.map((point) => ({ point, radius: Clearing.Trees })), ...buildings];
	const woodland = plantTrees({ outline, islands, keepClear, plotReach: plan.plotReach, plotEdge, seed }, country);
	const openings = pegs.map((peg) => podSpotFacing(peg, headingOverTheWater(peg, site), site));
	const reedLines = reedLinesOf(layout, frame);
	const grassClear = [...pegs.map((point) => ({ point, radius: Clearing.Platform })), ...openings.map((point) => ({ point, radius: Clearing.Pod })), ...buildings];
	const vegetation = new Vegetation({ woodland, outline, islands, openings, reedLines, keepClear: grassClear, plotEdge, season, seed, groundAt, country });
	const group = new Group().add(vegetation.group, facilities.group, createLakeFeatures(layout, frame, seed));
	return { group, labels: facilities.labels, vegetation };
}
