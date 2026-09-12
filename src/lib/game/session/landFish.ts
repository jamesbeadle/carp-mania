import type { CatchReport, SkillGains } from '$lib/contracts/CatchReport';
import { skillGainFromCatch } from '$lib/domain/anglerSkills';
import type { Honours } from '$lib/domain/fishing/honours';
import type { TackleMatch } from '$lib/domain/fishing/tackleMatch';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { Terrain } from '$lib/domain/layout/terrainAt';
import type { RodSetup } from '$lib/domain/tackle/rodSetup';
import type { Carp, Lake, Profile, Swim } from '$lib/domain/types';
import { castPointOf, type CastRod } from '../scene/rodState';
import { tackleMatchFor, type RolledBite } from './biteRoller';

export interface LandedFish {
	carp: Carp;
	swim: Swim;
	terrain: Terrain;
	castPoint: LayoutPoint;
	rodIndex: number;
	biteHour: number;
	setup: RodSetup;
	match: TackleMatch;
	hour: number;
	honours: Honours;
}

export function landedFishFor(lake: Lake, swim: Swim, carp: Carp, rod: CastRod, bite: RolledBite, hourOnTheMat: number, honours: Honours): LandedFish {
	return {
		carp,
		swim,
		terrain: rod.terrain,
		castPoint: castPointOf(rod),
		rodIndex: rod.index,
		biteHour: bite.hour,
		setup: rod.setup,
		match: tackleMatchFor(lake, rod),
		hour: hourOnTheMat,
		honours
	};
}

export function skillGainsFor(profile: Profile, match: TackleMatch): SkillGains {
	return {
		line: skillGainFromCatch(Number(profile.line_selection), match.line),
		rig: skillGainFromCatch(Number(profile.rig_selection), match.rig),
		bait: skillGainFromCatch(Number(profile.bait_selection), match.bait),
		watercraft: skillGainFromCatch(Number(profile.watercraft), (match.rig + match.tubing) / 2)
	};
}

export function catchReportFor(visitId: string, profile: Profile, landed: LandedFish): CatchReport {
	return {
		visitId,
		carpId: landed.carp.id,
		rodIndex: landed.rodIndex,
		hour: landed.biteHour,
		castPoint: { x: landed.castPoint.x, y: landed.castPoint.y },
		setup: landed.setup,
		swimName: landed.swim.name,
		skillGains: skillGainsFor(profile, landed.match)
	};
}

export async function reportLandedFish(lakeId: string, visitId: string, profile: Profile, landed: LandedFish) {
	const response = await fetch(`/fish/${lakeId}/catch`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(catchReportFor(visitId, profile, landed))
	});
	return response.ok;
}
