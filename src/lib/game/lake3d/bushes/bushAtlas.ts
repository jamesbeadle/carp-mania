import { seededRandom } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { paintAtlas } from '../grass/atlasTexture';
import { BushPalettes } from './bushPalette';
import { paintBramble, paintShrub, type BushBrush } from './bushPainters';

export const BushCells = { Shrub: 0, Bramble: 1 } as const;
export const BushGrid = { columns: 2, rows: 1, padding: 0.02 } as const;
const AtlasSeed = 2203;
const Painters: ((brush: BushBrush) => void)[] = [paintShrub, paintBramble];

export function bushAtlas(season: SeasonName, cellPixels: number) {
	const grid = { ...BushGrid, cellWidth: cellPixels, cellHeight: cellPixels };
	const palette = BushPalettes[season];
	const random = seededRandom(AtlasSeed);
	return paintAtlas(grid, (context, cellIndex) => Painters[cellIndex]({ context, size: cellPixels, random, palette }));
}
