import type { RegionCode } from '../world/regionCodes';

export type FarmGrade = 'stock' | 'good' | 'specialist' | 'record';

export interface Farm {
	id: string;
	name: string;
	region: RegionCode;
	grade: FarmGrade;
	latitude: number;
	longitude: number;
	story: string;
}

export interface GradeProfile {
	label: string;
	sellsUpToLb: number;
	condition: { lowest: number; highest: number };
	priceFactor: number;
	words: string;
}

export const GradeCatalogue: Record<FarmGrade, GradeProfile> = {
	stock: { label: 'Stock farm', sellsUpToLb: 12, condition: { lowest: 75, highest: 85 }, priceFactor: 0.8, words: 'Plentiful, cheap, small' },
	good: { label: 'Good farm', sellsUpToLb: 28, condition: { lowest: 80, highest: 90 }, priceFactor: 1, words: 'Honest fish up to the high twenties' },
	specialist: { label: 'Specialist', sellsUpToLb: 40, condition: { lowest: 85, highest: 92 }, priceFactor: 1.4, words: 'A few big fish a week, dear' },
	record: { label: 'Record grower', sellsUpToLb: 55, condition: { lowest: 88, highest: 95 }, priceFactor: 2.2, words: 'One or two fish a week, some weeks none — the biggest there are' }
};

export const FarmCatalogue: Farm[] = [
	{ id: 'meadow-fisheries', name: 'Meadow Fisheries', region: 'uk_ireland', grade: 'stock', latitude: 52.4, longitude: -1.5, story: 'Stockies by the hundred from the Midlands.' },
	{ id: 'fenland-carp', name: 'Fenland Carp Co.', region: 'uk_ireland', grade: 'good', latitude: 52.6, longitude: 0.2, story: 'Deep-bodied mirrors grown in the fens.' },
	{ id: 'breche-piscicole', name: 'Brèche Piscicole', region: 'france', grade: 'good', latitude: 47.9, longitude: 1.9, story: 'Étang-grown commons and mirrors from the Loire.' },
	{ id: 'etang-du-roi', name: 'Étang du Roi', region: 'france', grade: 'specialist', latitude: 48.6, longitude: 2.6, story: 'Forties from the old royal ponds.' },
	{ id: 'polder-vis', name: 'Polder Vis', region: 'benelux_germany', grade: 'good', latitude: 52.2, longitude: 5.4, story: 'Tidy Dutch fish from the polders.' },
	{ id: 'ebro-piscifactoria', name: 'Ebro Piscifactoría', region: 'iberia', grade: 'stock', latitude: 41.2, longitude: 0.5, story: 'Fast-grown commons off the Ebro.' },
	{ id: 'po-valley-carp', name: 'Po Valley Carp', region: 'italy_balkans', grade: 'specialist', latitude: 45, longitude: 10.9, story: 'Huge commons from the Po.' },
	{ id: 'tisza-halgazdasag', name: 'Tisza Halgazdaság', region: 'central_europe', grade: 'specialist', latitude: 47.2, longitude: 20.2, story: 'Monster mirrors from the Hungarian plain.' },
	{ id: 'donau-karpfenhof', name: 'Donau Karpfenhof', region: 'danube', grade: 'record', latitude: 44.4, longitude: 27.8, story: 'The record growers. A fifty a season, if that.' },
	{ id: 'lakeland-carp', name: 'Lakeland Carp Co.', region: 'north_america', grade: 'stock', latitude: 43.1, longitude: -79.1, story: 'Cheap commons by the truckload.' },
	{ id: 'karoo-dams', name: 'Karoo Dams Hatchery', region: 'south_africa', grade: 'stock', latitude: -29.7, longitude: 24.8, story: 'Dam-reared fish in the sun.' },
	{ id: 'nishikigoi-kogyo', name: 'Nishikigoi Kōgyō', region: 'japan_east_asia', grade: 'good', latitude: 37.4, longitude: 138.8, story: 'Koi heritage — ghosts and pale fish.' }
];

export function farmById(id: string): Farm | null {
	return FarmCatalogue.find((farm) => farm.id === id) ?? null;
}
