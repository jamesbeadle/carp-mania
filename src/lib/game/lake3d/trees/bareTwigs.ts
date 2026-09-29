import { MathUtils } from 'three';
import type { BranchLevel, Habit } from './habitTypes';
import type { TreeKind } from './treeKinds';

const degrees = MathUtils.degToRad;
const Twig: BranchLevel = { count: 4, from: 0.25, to: 1, angle: degrees(38), length: 0.6, bend: 0.15, wander: 0.55, segments: 2, radius: 0.55, taper: 0.15 };

const TwigsOf: Record<TreeKind, Partial<BranchLevel>> = {
	oak: { count: 5, bend: 0.05, wander: 0.7 },
	alder: { count: 4 },
	willow: { count: 3, angle: degrees(30), length: 0.7, bend: -1.4, segments: 3, wander: 0.25 },
	birch: { count: 5, bend: -0.9, length: 0.75 },
	poplar: { count: 4, angle: degrees(20), bend: 0.4 },
	pine: {},
	spruce: {},
	holly: {}
};

export function withTwigs(habit: Habit, kind: TreeKind): Habit {
	return { ...habit, levels: [...habit.levels, { ...Twig, ...TwigsOf[kind] }] };
}
