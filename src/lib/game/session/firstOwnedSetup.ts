import { SetupSlots, type RodSetup } from '$lib/domain/tackle/rodSetup';
import { ownedOfKind, type OwnedItem } from '$lib/domain/tackle/tackleBox';

export function firstOwnedSetup(box: OwnedItem[]): RodSetup | null {
	const setup: Partial<RodSetup> = {};
	for (const slot of SetupSlots) {
		const first = ownedOfKind(box, slot)[0];
		if (!first) return null;
		setup[slot] = first.itemId;
	}
	return setup as RodSetup;
}
