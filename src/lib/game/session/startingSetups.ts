import { defaultRodSetup, isRodSetup, MaximumRods, type RodSetup } from '$lib/domain/tackle/rodSetup';
import { isSetupOwned, type OwnedItem, type OwnedTackle } from '$lib/domain/tackle/tackleBox';
import { firstOwnedSetup } from './firstOwnedSetup';

export function usableRodsOf(saved: RodSetup[], owned: OwnedTackle[]) {
	return saved.filter((setup) => isRodSetup(setup) && isSetupOwned(owned, setup));
}

export function setupsFor(rods: RodSetup[], box: OwnedItem[]): RodSetup[] {
	const fallback = firstOwnedSetup(box) ?? defaultRodSetup();
	return Array.from({ length: MaximumRods }, (_, index) => structuredClone(rods[index] ?? fallback));
}

export function rodCountFor(rods: RodSetup[]) {
	return rods.length > 0 ? Math.min(MaximumRods, rods.length) : MaximumRods;
}
