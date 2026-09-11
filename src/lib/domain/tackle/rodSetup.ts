import type { BaitName } from './baits';
import type { HookChoice } from './hooks';
import type { LineChoice } from './lines';
import type { RigName } from './rigs';
import type { TubingColour } from './tubing';

export const MaximumRods = 3;

export interface RodSetup {
	line: LineChoice;
	hook: HookChoice;
	rig: RigName;
	bait: BaitName;
	tubing: TubingColour;
}

export function defaultRodSetup(): RodSetup {
	return {
		line: { colour: 'clear', thickness: 'medium' },
		hook: { size: 4, finish: 'matt' },
		rig: 'hair_lead_clip',
		bait: 'fishmeal_boilie',
		tubing: 'brown'
	};
}
