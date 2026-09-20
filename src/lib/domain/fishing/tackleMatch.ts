import type { Terrain } from '../layout/terrainAt';
import type { RodKit } from '../tackle/rodSetup';
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

const Weights = {
	Line: 0.25,
	Hook: 0.15,
	Rig: 0.2,
	Bait: 0.3,
	Tubing: 0.1
} as const;
const WeedyFeatures = ['weed_bed', 'reed_line', 'lily_pads'];

export function matchTackleToWater(kit: RodKit, lake: WaterForTackle, terrain: Terrain): TackleMatch {
	const isWeedy = WeedyFeatures.includes(terrain.feature);
	const transparency = Number(lake.transparency);
	const baitStats = kit.bait.bait;
	const silt = Number(lake.silt);
	const line = lineMatchScore(kit.line.line, transparency, silt, terrain.bed, isWeedy);
	const hook = hookMatchScore(kit.hook.hook);
	const rig = rigMatchScore(kit.rig.rig, terrain, baitStats.kind);
	const bait = baitTrustScore(baitStats, lake.feed_stock);
	const tubing = tubingMatchScore(kit.tubing.tubing, baitStats.kind, terrain, transparency);
	const scores = { line, hook, rig, bait, tubing };
	return { ...scores, overall: overallOf(scores) };
}

function overallOf(scores: Omit<TackleMatch, 'overall'>) {
	const { line, hook, rig, bait, tubing } = scores;
	const presentation = line * Weights.Line + hook * Weights.Hook + rig * Weights.Rig;
	return presentation + bait * Weights.Bait + tubing * Weights.Tubing;
}
