import { seededRandom } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { paintAtlas } from '../grass/atlasTexture';
import type { BushBrush } from './bushBrush';
import { BushPalettes } from './bushPalette';
import { paintBramble } from './bramblePainter';
import { paintShrub, type ShrubLeaves } from './shrubPainter';

export const BushCells = { Shrub: 0, DarkShrub: 1, Bramble: 2, FloweringBramble: 3 } as const;
export const BushGrid = { columns: 4, rows: 1, padding: 0.02 } as const;
const AtlasSeed = 2203;
const LeafLength = { Shrub: 13, DarkShrub: 10 } as const;

function shrubLeaves(brush: BushBrush, isDark: boolean): ShrubLeaves {
	const { palette } = brush;
	if (isDark) return { colours: palette.darkLeaves, share: palette.darkLeafShare, length: LeafLength.DarkShrub };
	return { colours: palette.leaves, share: palette.leafShare, length: LeafLength.Shrub };
}

const Painters: ((brush: BushBrush) => void)[] = [
	(brush) => paintShrub(brush, shrubLeaves(brush, false)),
	(brush) => paintShrub(brush, shrubLeaves(brush, true)),
	(brush) => paintBramble(brush, false),
	(brush) => paintBramble(brush, true)
];

export function bushAtlas(season: SeasonName, cellPixels: number) {
	const grid = { ...BushGrid, cellWidth: cellPixels, cellHeight: cellPixels };
	const palette = BushPalettes[season];
	const random = seededRandom(AtlasSeed);
	return paintAtlas(grid, (context, cellIndex) => Painters[cellIndex]({ context, size: cellPixels, random, palette }));
}
