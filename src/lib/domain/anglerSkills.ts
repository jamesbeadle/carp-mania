export const SkillScale = { Lowest: 0, Highest: 100, Starter: 25 } as const;

export const SkillNames = ['line_selection', 'rig_selection', 'bait_selection', 'watercraft'] as const;
export type SkillName = (typeof SkillNames)[number];

export const SkillLabels: Record<SkillName, string> = {
	line_selection: 'Line selection',
	rig_selection: 'Rig selection',
	bait_selection: 'Bait selection',
	watercraft: 'Watercraft'
};

const GainPerCatch = 0.6;
const GainForWellMatchedTackle = 0.9;

export function skillGainFromCatch(currentSkill: number, matchScore: number) {
	const headroom = (SkillScale.Highest - currentSkill) / SkillScale.Highest;
	return round(GainPerCatch * headroom + GainForWellMatchedTackle * matchScore * headroom);
}

export function clampSkill(value: number) {
	const rounded = round(value);
	const notBelowLowest = Math.max(SkillScale.Lowest, rounded);
	return Math.min(SkillScale.Highest, notBelowLowest);
}

function round(value: number) {
	return Math.round(value * 100) / 100;
}
