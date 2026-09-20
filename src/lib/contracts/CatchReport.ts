import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { RodSetup } from '$lib/domain/tackle/rodSetup';
import type { AwardKey } from '$lib/domain/trophies/awards';
import type { BountyWon } from './Bounties';

export interface SkillGains {
	line: number;
	rig: number;
	bait: number;
	watercraft: number;
}

export interface CatchReport {
	visitId: string;
	carpId: string;
	shoalId: string | null;
	rodIndex: number;
	hour: number;
	castPoint: LayoutPoint;
	setup: RodSetup;
	swimName: string;
	skillGains: SkillGains;
}

export interface CatchHonours {
	awards: AwardKey[];
	bountyWon: BountyWon | null;
}
