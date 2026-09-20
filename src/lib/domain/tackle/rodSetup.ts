import { tackleItemOfKind } from './catalogue';
import type { BaitItem, HookItem, LeadItem, LineItem, ReelItem, RigItem, RodItem, TubingItem } from './tackleItem';

export const MaximumRods = 3;

export interface RodSetup {
	rod: string;
	reel: string;
	line: string;
	hook: string;
	rig: string;
	lead: string;
	tubing: string;
	bait: string;
}

export interface RodKit {
	rod: RodItem;
	reel: ReelItem;
	line: LineItem;
	hook: HookItem;
	rig: RigItem;
	lead: LeadItem;
	tubing: TubingItem;
	bait: BaitItem;
}

export const SetupSlots = ['rod', 'reel', 'line', 'hook', 'rig', 'lead', 'tubing', 'bait'] as const;
export type SetupSlot = (typeof SetupSlots)[number];

export const StarterSetup: RodSetup = {
	rod: 'bankside_basics-rod-2.75-12',
	reel: 'bankside_basics-reel-carp_large',
	line: 'bankside_basics-line-15-clear',
	hook: 'bankside_basics-hook-4-micro-matt',
	rig: 'bankside_basics-rig-hair_lead_clip',
	lead: 'bankside_basics-lead',
	tubing: 'bankside_basics-tubing-brown',
	bait: 'meadowmill-bait-fishmeal_boilie'
};

export function defaultRodSetup(): RodSetup {
	return { ...StarterSetup };
}

export function kitOf(setup: RodSetup): RodKit | null {
	const rod = tackleItemOfKind(setup.rod, 'rod');
	const reel = tackleItemOfKind(setup.reel, 'reel');
	const line = tackleItemOfKind(setup.line, 'line');
	const hook = tackleItemOfKind(setup.hook, 'hook');
	const rig = tackleItemOfKind(setup.rig, 'rig');
	const lead = tackleItemOfKind(setup.lead, 'lead');
	const tubing = tackleItemOfKind(setup.tubing, 'tubing');
	const bait = tackleItemOfKind(setup.bait, 'bait');
	if (!rod || !reel || !line || !hook || !rig || !lead || !tubing || !bait) return null;
	return { rod, reel, line, hook, rig, lead, tubing, bait };
}

export function kitFor(setup: RodSetup): RodKit {
	const kit = kitOf(setup);
	if (!kit) throw new Error(`A rod setup names tackle the catalogue does not know: ${Object.values(setup).join(', ')}`);
	return kit;
}

export function isRodSetup(candidate: unknown): candidate is RodSetup {
	const setup = candidate as Partial<RodSetup> | null;
	if (!setup || typeof setup !== 'object') return false;
	return SetupSlots.every((slot) => typeof setup[slot] === 'string') && kitOf(setup as RodSetup) !== null;
}
