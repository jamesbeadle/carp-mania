import { seededRandom } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { paintAtlas, type AtlasGrid } from './atlasTexture';
import { CoverPalettes } from './coverPalette';
import { paintButtercups, paintDaisiesAndClover } from './flowerPainters';
import { paintMeadow, paintTuft, type CellBrush } from './grassPainters';
import { paintRushes, paintSedge, paintSpikes } from './marginPainters';
import { paintCloverSward, paintSward } from './swardPainters';

export const CoverCells = { ShortGrass: 0, TuftedGrass: 1, Meadow: 2, Buttercups: 3, Daisies: 4, Rushes: 5, Sedge: 6, Spikes: 7, Sward: 8, CloverSward: 9 } as const;
export type CoverCell = (typeof CoverCells)[keyof typeof CoverCells];

export const CoverGrid = { columns: 5, rows: 2, padding: 0.03 } as const;
const AtlasSeed = 4127;

const Painters: ((brush: CellBrush) => void)[] = [
	(brush) => paintTuft(brush, { count: 260, shortest: 0.25, lean: 0.3, widest: 6, dryShare: 0.08, isSpread: true, dome: 0.6 }),
	(brush) => paintTuft(brush, { count: 85, shortest: 0.2, lean: 0.7, widest: 6, dryShare: 0.2, dome: 0.3 }),
	paintMeadow,
	paintButtercups,
	paintDaisiesAndClover,
	paintRushes,
	paintSedge,
	paintSpikes,
	paintSward,
	paintCloverSward
];

export function coverAtlas(season: SeasonName, cellPixels: number) {
	const grid: AtlasGrid = { ...CoverGrid, cellWidth: cellPixels, cellHeight: cellPixels };
	const palette = CoverPalettes[season];
	const random = seededRandom(AtlasSeed);
	return paintAtlas(grid, (context, cellIndex) => Painters[cellIndex]({ context, size: cellPixels, random, palette }));
}
