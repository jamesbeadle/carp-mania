import { seededRandom } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { paintAtlas } from '../grass/atlasTexture';
import { ReedPalettes } from './reedPalette';
import { paintPhragmites, type ReedBrush } from './reedPainters';
import { paintReedmace } from './reedmacePainter';

export const ReedCells = { Plumed: 0, Leafy: 1, Reedmace: 2, Sparse: 3 } as const;
export const ReedGrid = { columns: 4, rows: 1, padding: 0.02 } as const;
const CellAspect = 2;
const AtlasSeed = 7331;

const Painters: ((brush: ReedBrush) => void)[] = [
	(brush) => paintPhragmites(brush, { stems: 22, plumeShare: 0.6, leavesPerStem: 7 }),
	(brush) => paintPhragmites(brush, { stems: 20, plumeShare: 0.2, leavesPerStem: 9 }),
	paintReedmace,
	(brush) => paintPhragmites(brush, { stems: 12, plumeShare: 0.5, leavesPerStem: 6 })
];

export function reedAtlas(season: SeasonName, cellPixels: number) {
	const cellHeight = cellPixels * CellAspect;
	const grid = { ...ReedGrid, cellWidth: cellPixels, cellHeight };
	const palette = ReedPalettes[season];
	const random = seededRandom(AtlasSeed);
	return paintAtlas(grid, (context, cellIndex) => Painters[cellIndex]({ context, width: cellPixels, height: cellHeight, random, palette }));
}
