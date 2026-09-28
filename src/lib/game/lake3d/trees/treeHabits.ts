import { MathUtils } from 'three';
import type { BranchLevel, Habit } from './habitTypes';
import type { TreeKind } from './treeKinds';

const degrees = MathUtils.degToRad;
const Straight = { from: 0, to: 0, angle: 0, count: 1, bend: 0 } as const;

type TrunkShape = Pick<BranchLevel, 'length' | 'radius' | 'wander' | 'segments' | 'taper'>;

function trunk(shape: TrunkShape): BranchLevel {
	return { ...Straight, ...shape };
}

const Oval = { Least: 0.35, Start: 0.15, Swell: 0.75 } as const;
const Cone = { Tip: 0.08, Curve: 0.85 } as const;
const Column = { Least: 0.45, Widest: 1.3, Swell: 0.55 } as const;
const Shortening = { Base: 1.1, Loss: 0.45 } as const;

const oval = (along: number) => Oval.Least + Math.sin(Math.PI * (Oval.Start + along * (1 - Oval.Start))) * Oval.Swell;
const cone = (along: number) => Cone.Tip + Math.pow(1 - along, Cone.Curve);
const column = (along: number) => Column.Least + Math.sin(Math.PI * Math.min(1, along * Column.Widest)) * Column.Swell;
const shortening = (along: number) => Shortening.Base - along * Shortening.Loss;

export const Habits: Record<TreeKind, Habit> = {
	oak: {
		trunk: trunk({ length: 0.27, radius: 0.034, wander: 0.12, segments: 4, taper: 0.72 }),
		levels: [
			{ count: 5, from: 0.5, to: 1, angle: degrees(50), length: 1.5, bend: 0.3, wander: 0.35, segments: 5, radius: 0.7, taper: 0.45, reach: shortening },
			{ count: 4, from: 0.25, to: 1, angle: degrees(42), length: 0.55, bend: 0.35, wander: 0.45, segments: 3, radius: 0.6, taper: 0.35, reach: shortening },
			{ count: 3, from: 0.35, to: 1, angle: degrees(45), length: 0.5, bend: 0.15, wander: 0.5, segments: 2, radius: 0.6, taper: 0.3 }
		],
		sitesAlong: 2,
		sitesOnBranches: 2
	},
	alder: {
		trunk: trunk({ length: 1, radius: 0.02, wander: 0.06, segments: 8, taper: 0.1 }),
		levels: [
			{ count: 16, from: 0.16, to: 0.96, angle: degrees(58), length: 0.3, bend: 0.15, wander: 0.35, segments: 3, radius: 0.45, taper: 0.3, reach: oval },
			{ count: 3, from: 0.3, to: 1, angle: degrees(40), length: 0.45, bend: 0.1, wander: 0.4, segments: 2, radius: 0.55, taper: 0.3 }
		],
		sitesAlong: 2,
		sitesOnBranches: 2
	},
	willow: {
		trunk: trunk({ length: 0.3, radius: 0.033, wander: 0.22, segments: 3, taper: 0.75 }),
		levels: [
			{ count: 5, from: 0.72, to: 1, angle: degrees(42), length: 1.3, bend: 0.3, wander: 0.3, segments: 4, radius: 0.65, taper: 0.4 },
			{ count: 5, from: 0.3, to: 1, angle: degrees(55), length: 0.62, bend: -0.9, wander: 0.35, segments: 4, radius: 0.5, taper: 0.25 }
		],
		sitesAlong: 2,
		sitesOnBranches: 1
	},
	birch: {
		trunk: trunk({ length: 1, radius: 0.013, wander: 0.18, segments: 8, taper: 0.08 }),
		levels: [
			{ count: 13, from: 0.3, to: 0.97, angle: degrees(40), length: 0.26, bend: -0.4, wander: 0.4, segments: 4, radius: 0.4, taper: 0.25, reach: oval },
			{ count: 3, from: 0.35, to: 1, angle: degrees(35), length: 0.5, bend: -0.9, wander: 0.4, segments: 3, radius: 0.55, taper: 0.3 }
		],
		sitesAlong: 2,
		sitesOnBranches: 2
	},
	poplar: {
		trunk: trunk({ length: 1, radius: 0.022, wander: 0.04, segments: 8, taper: 0.1 }),
		levels: [
			{ count: 30, from: 0.06, to: 0.97, angle: degrees(18), length: 0.16, bend: 0.3, wander: 0.25, segments: 3, radius: 0.35, taper: 0.3, reach: column },
			{ count: 2, from: 0.4, to: 1, angle: degrees(22), length: 0.5, bend: 0.2, wander: 0.3, segments: 2, radius: 0.55, taper: 0.3 }
		],
		sitesAlong: 1,
		sitesOnBranches: 2
	},
	pine: {
		trunk: trunk({ length: 1, radius: 0.022, wander: 0.1, segments: 7, taper: 0.25 }),
		levels: [
			{ count: 8, from: 0.6, to: 0.98, angle: degrees(74), length: 0.3, bend: 0.4, wander: 0.45, segments: 4, radius: 0.5, taper: 0.35, reach: shortening },
			{ count: 3, from: 0.4, to: 1, angle: degrees(45), length: 0.45, bend: 0.45, wander: 0.4, segments: 2, radius: 0.55, taper: 0.35 }
		],
		sitesAlong: 1,
		sitesOnBranches: 2,
		hasLeader: true
	},
	spruce: {
		trunk: trunk({ length: 1, radius: 0.02, wander: 0.02, segments: 8, taper: 0.05 }),
		levels: [
			{ count: 34, from: 0.06, to: 0.985, angle: degrees(100), length: 0.33, bend: -0.1, wander: 0.2, segments: 3, radius: 0.3, taper: 0.2, reach: cone },
			{ count: 4, from: 0.3, to: 1, angle: degrees(55), length: 0.4, bend: -0.3, wander: 0.3, segments: 1, radius: 0.5, taper: 0.3 }
		],
		sitesAlong: 1,
		sitesOnBranches: 2,
		hasLeader: true
	}
};
