import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { Lake, Swim } from '$lib/domain/types';
import type { DraftShape } from '../render/drawUnderConstruction';
import type { CastReach } from '../session/castReach';
import type { SwimmingFish } from './fishSchool';
import type { RodOnBank } from './rodState';

export interface SceneInput {
	lake: Lake;
	swims: Swim[];
	school: SwimmingFish[];
	selectedSwimId: string | null;
	hoveredSwimId: string | null;
	rods: RodOnBank[];
	isAnglerOnBank: boolean;
	drafts?: DraftShape[];
	showingAt?: LayoutPoint[];
	pixelsPerScenePixel?: number;
	castReach?: CastReach | null;
}
