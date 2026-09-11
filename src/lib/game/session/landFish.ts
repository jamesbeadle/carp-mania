import { skillGainFromCatch } from '$lib/domain/anglerSkills';
import type { TackleMatch } from '$lib/domain/fishing/tackleMatch';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { Terrain } from '$lib/domain/layout/terrainAt';
import type { RodSetup } from '$lib/domain/tackle/rodSetup';
import type { Carp, Profile, Swim } from '$lib/domain/types';

export interface LandedFish {
	carp: Carp;
	swim: Swim;
	terrain: Terrain;
	castPoint: LayoutPoint;
	rodIndex: number;
	setup: RodSetup;
	match: TackleMatch;
	hour: number;
}

export function skillGainsFor(profile: Profile, match: TackleMatch) {
	return {
		line: skillGainFromCatch(Number(profile.line_selection), match.line),
		rig: skillGainFromCatch(Number(profile.rig_selection), match.rig),
		bait: skillGainFromCatch(Number(profile.bait_selection), match.bait),
		watercraft: skillGainFromCatch(Number(profile.watercraft), (match.rig + match.tubing) / 2)
	};
}

export async function reportLandedFish(lakeId: string, visitId: string, profile: Profile, landed: LandedFish) {
	const response = await fetch(`/fish/${lakeId}/catch`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			visitId,
			carpId: landed.carp.id,
			swimName: landed.swim.name,
			castPoint: { x: landed.castPoint.x, y: landed.castPoint.y },
			rodIndex: landed.rodIndex,
			hour: landed.hour,
			rig: landed.setup.rig,
			bait: landed.setup.bait,
			hookSize: landed.setup.hook.size,
			skillGains: skillGainsFor(profile, landed.match)
		})
	});
	return response.ok;
}
