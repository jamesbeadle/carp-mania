import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { RodSetup } from '$lib/domain/tackle/rodSetup';

export interface SkillGains {
	line: number;
	rig: number;
	bait: number;
	watercraft: number;
}

export interface CatchReport {
	visitId: string;
	carpId: string;
	rodIndex: number;
	hour: number;
	castPoint: LayoutPoint;
	setup: RodSetup;
	swimName: string;
	skillGains: SkillGains;
}
