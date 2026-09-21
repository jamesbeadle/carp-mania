export type HubDoorId = 'fish_my_lake' | 'run_fishery' | 'find_water' | 'the_world' | 'tackle_shop';

export interface HubDoor {
	id: Exclude<HubDoorId, 'fish_my_lake'>;
	label: string;
	href: string;
}

export const RunFisheryDoor: HubDoor = { id: 'run_fishery', label: 'Run fishery', href: '/lake' };
export const FinishSettingUpDoor: HubDoor = { id: 'run_fishery', label: 'Finish setting up', href: '/setup' };

export const HubDoors: HubDoor[] = [
	{ id: 'find_water', label: 'Find water to fish', href: '/lakes' },
	{ id: 'the_world', label: 'The world', href: '/world' },
	{ id: 'tackle_shop', label: 'Tackle shop', href: '/market' }
];

export function runFisheryDoorFor(isSetupComplete: boolean): HubDoor {
	return isSetupComplete ? RunFisheryDoor : FinishSettingUpDoor;
}
