import { lakeDifficultyOf } from '../lakeDifficulty';
import { headCountIn } from '../stock/headCount';
import type { Shoal } from '../stock/shoals';
import type { Carp, Lake } from '../types';

export const EasyWater = 100;

export function difficultyOfWater(lake: Pick<Lake, 'acres' | 'plot_acres' | 'layout' | 'transparency' | 'weed' | 'silt'>, carp: Pick<Carp, 'id'>[], shoals: Pick<Shoal, 'count'>[]) {
	return lakeDifficultyOf(lake, headCountIn(carp, shoals)).difficulty;
}
