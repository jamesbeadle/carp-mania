export interface AtlasRegion {
	x: number;
	y: number;
	width: number;
	height: number;
}

export type FoliageRegion = 'broadleaf' | 'broadleafFine' | 'roundleaf' | 'roundleafFine' | 'birch' | 'birchFine' | 'willow' | 'needles' | 'spray' | 'twigs' | 'whips';

export const AtlasGrid = { Columns: 8, Rows: 4 } as const;

function cell(column: number, row: number, rows = 1): AtlasRegion {
	return { x: column / AtlasGrid.Columns, y: row / AtlasGrid.Rows, width: 1 / AtlasGrid.Columns, height: rows / AtlasGrid.Rows };
}

export const AtlasRegions: Record<FoliageRegion, AtlasRegion[]> = {
	broadleaf: [cell(0, 0), cell(1, 0), cell(2, 0)],
	whips: [cell(3, 0)],
	broadleafFine: [cell(4, 0), cell(5, 0), cell(6, 0), cell(7, 0)],
	birch: [cell(0, 1), cell(1, 1), cell(2, 1)],
	birchFine: [cell(3, 1), cell(4, 1), cell(5, 1)],
	needles: [cell(6, 1), cell(7, 1)],
	willow: [cell(0, 2, 2), cell(1, 2, 2), cell(2, 2, 2)],
	spray: [cell(3, 2, 2), cell(4, 2, 2)],
	twigs: [cell(5, 2), cell(5, 3)],
	roundleaf: [cell(6, 2), cell(7, 2)],
	roundleafFine: [cell(6, 3), cell(7, 3)]
};
