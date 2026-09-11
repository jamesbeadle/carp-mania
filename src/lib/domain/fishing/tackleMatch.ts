import type { Terrain } from '../layout/terrainAt';
import type { RodSetup } from '../tackle/rodSetup';
import type { Lake } from '../types';
import { baitTrustScore } from './baitTrust';
import { hookMatchScore } from './hookMatch';
import { lineMatchScore } from './lineMatch';
import { rigMatchScore } from './rigMatch';
import { tubingMatchScore } from './tubingMatch';

export interface TackleMatch {
	line: number;
	hook: number;
	rig: number;
	bait: number;
	tubing: number;
	overall: number;
}

export type WaterForTackle = Pick<Lake, 'transparency' | 'silt' | 'feed_stock'>;

export function matchTackleToWater(rod: RodSetup, lake: WaterForTackle, terrain: Terrain): TackleMatch {
	const line = lineMatchScore(rod.line, lake.transparency, lake.silt);
	const hook = hookMatchScore(rod.hook, lake.transparency);
	const rig = rigMatchScore(rod.rig, terrain);
	const bait = baitTrustScore(rod.bait, lake.feed_stock);
	const tubing = tubingMatchScore(rod.tubing, rod.bait, terrain, lake.transparency);
	const overall = line * 0.25 + hook * 0.15 + rig * 0.2 + bait * 0.3 + tubing * 0.1;
	return { line, hook, rig, bait, tubing, overall };
}
