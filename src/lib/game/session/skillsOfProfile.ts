import type { Skills } from '$lib/domain/anglerRating';
import type { Profile } from '$lib/domain/types';

export function skillsOfProfile(profile: Profile): Skills {
	return {
		line_selection: Number(profile.line_selection),
		rig_selection: Number(profile.rig_selection),
		bait_selection: Number(profile.bait_selection),
		watercraft: Number(profile.watercraft)
	};
}
