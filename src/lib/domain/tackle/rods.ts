export type TestCurveLb = 2.75 | 3 | 3.25 | 3.5;
export type RodLengthFeet = 10 | 12 | 13;

export const RodLandsUpToLb: Record<TestCurveLb, number> = { 2.75: 35, 3: 50, 3.25: 62, 3.5: 100 };
export const RodLengthCastFactor: Record<RodLengthFeet, number> = { 10: 0.85, 12: 1, 13: 1.12 };
export const RodWords: Record<TestCurveLb, string> = { 2.75: 'The all-round carp rod', 3: 'For big fish and big waters', 3.25: 'Hand-built — nothing on sale is like it', 3.5: 'Specialist — heavy, and you feel it on a twenty' };
export const RodLengthWords: Record<RodLengthFeet, string> = { 10: 'Tight swims, tree-lined margins', 12: 'Standard', 13: 'Range work' };
export const SnapRiskPerSecond = 0.05;
export const FullDuplon = { SnapAboveWidening: 0.04, SlackBelowWidening: 0.03 } as const;

export interface RodStats {
	testCurveLb: TestCurveLb;
	lengthFeet: RodLengthFeet;
	isFullDuplon: boolean;
}

export function landsUpToLb(rod: Pick<RodStats, 'testCurveLb'>) {
	return RodLandsUpToLb[rod.testCurveLb];
}

export function rodSnapChancePerSecond(fishLb: number, rod: Pick<RodStats, 'testCurveLb'>) {
	const lands = landsUpToLb(rod);
	return Math.max(0, (fishLb - lands) / lands) * SnapRiskPerSecond;
}

export function isUnderGunned(fishLb: number, rod: Pick<RodStats, 'testCurveLb'>) {
	return fishLb > landsUpToLb(rod);
}
