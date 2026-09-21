import type { CatchHonours, CatchReport, SkillGains } from '$lib/contracts/CatchReport';
import { skillGainFromCatch } from '$lib/domain/anglerSkills';
import type { Honours } from '$lib/domain/fishing/honours';
import type { TackleMatch } from '$lib/domain/fishing/tackleMatch';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { Terrain } from '$lib/domain/layout/terrainAt';
import type { RodSetup } from '$lib/domain/tackle/rodSetup';
import { isProvisionalId, shoalIdOfProvisional } from '$lib/domain/fishing/takers';
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

function shoalIdOf(carpId: string) {
	return isProvisionalId(carpId) ? shoalIdOfProvisional(carpId) : null;
}

export function catchReportFor(visitId: string, profile: Profile, landed: LandedFish): CatchReport {
	return {
		visitId,
		carpId: landed.carp.id,
		shoalId: shoalIdOf(landed.carp.id),
		rodIndex: landed.rodIndex,
		hour: landed.biteHour,
		castPoint: { x: landed.castPoint.x, y: landed.castPoint.y },
		setup: landed.setup,
		swimName: landed.swim.name,
		skillGains: skillGainsFor(profile, landed.match)
	};
}

export interface CatchReportOutcome extends CatchHonours {
	isSaved: boolean;
	reason: string | null;
	carp: Carp | null;
}

const NoReasonGiven = 'the bailiff gave no reason';
const NoHonours: CatchHonours = { awards: [] };

export async function reportLandedFish(lakeId: string, visitId: string, profile: Profile, landed: LandedFish): Promise<CatchReportOutcome> {
	const response = await fetch(`/fish/${lakeId}/catch`, {
		method: 'POST',
		headers: { 'content-type': 'application/json', accept: 'application/json' },
		body: JSON.stringify(catchReportFor(visitId, profile, landed))
	});
	if (response.ok) return { isSaved: true, reason: null, ...(await savedIn(response)) };
	return { isSaved: false, reason: await reasonIn(response), carp: null, ...NoHonours };
}

async function savedIn(response: Response) {
	const body = (await response.json().catch(() => null)) as ({ carp?: Carp } & Partial<CatchHonours>) | null;
	return { carp: body?.carp ?? null, awards: body?.awards ?? NoHonours.awards };
}

async function reasonIn(response: Response) {
	const body = (await response.json().catch(() => null)) as { message?: string } | null;
	return body?.message ?? `${NoReasonGiven} (${response.status})`;
}
