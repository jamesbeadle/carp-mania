import type { LakeLayout } from '$lib/domain/layout/layoutTypes';
import { Heights } from './lakeGround';

const MetresPerFootOfDepth = 0.3048;
const DepthShown = 0.45;

export function bedDepthFor(layout: LakeLayout) {
	return Math.min(Heights.BedDeepest, Math.max(Heights.ShallowestBed, layout.baseDepthFeet * MetresPerFootOfDepth * DepthShown));
}
