import { kitOf, StarterSetup, type RodSetup } from './rodSetup';
import { SetupSlots } from './rodSetup';
import type { TackleItem } from './tackleItem';
import type { TackleKind } from './kinds';

export type KitInUse = Record<TackleKind, TackleItem | null>;

export function kitInUseFrom(savedRods: RodSetup[]): KitInUse {
	const [firstRod] = savedRods;
	const kit = kitOf(firstRod ?? StarterSetup) ?? kitOf(StarterSetup);
	const entries = SetupSlots.map((slot) => [slot, kit ? kit[slot] : null]);
	return Object.fromEntries(entries) as KitInUse;
}
