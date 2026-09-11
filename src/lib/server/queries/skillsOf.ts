import type { AnglerSkills } from '$lib/contracts/AnglerDirectory';
import { SkillNames } from '$lib/domain/anglerSkills';

export function skillsOf(row: AnglerSkills): AnglerSkills {
	return Object.fromEntries(SkillNames.map((skill) => [skill, Number(row[skill])])) as AnglerSkills;
}
