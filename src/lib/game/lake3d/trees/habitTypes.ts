export interface BranchLevel {
	count: number;
	from: number;
	to: number;
	angle: number;
	length: number;
	bend: number;
	wander: number;
	segments: number;
	radius: number;
	taper: number;
	reach?: (along: number) => number;
}

export interface Habit {
	trunk: BranchLevel;
	levels: BranchLevel[];
	sitesAlong: number;
	sitesOnBranches: number;
	hasLeader?: boolean;
}
