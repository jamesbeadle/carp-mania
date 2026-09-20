import type { TackleKind } from './kinds';
import { tackleItem } from './catalogue';
import type { RodKit, RodSetup } from './rodSetup';
import { SetupSlots } from './rodSetup';
import type { TackleItem } from './tackleItem';

export interface OwnedTackle {
	itemId: string;
	quantity: number;
	spoilsAt: string | null;
}

export interface OwnedItem extends OwnedTackle {
	item: TackleItem;
}

export function ownedItemsIn(owned: OwnedTackle[]): OwnedItem[] {
	return owned.flatMap((line) => {
		const item = tackleItem(line.itemId);
		return item ? [{ ...line, item }] : [];
	});
}

export function ownedOfKind(box: OwnedItem[], kind: TackleKind) {
	const ofKind = box.filter((owned) => owned.item.kind === kind);
	return ofKind.filter((owned) => owned.quantity > 0);
}

export function quantityOwned(box: OwnedTackle[], itemId: string) {
	return box.find((owned) => owned.itemId === itemId)?.quantity ?? 0;
}

export function isSetupOwned(box: OwnedTackle[], setup: RodSetup) {
	return SetupSlots.every((slot) => quantityOwned(box, setup[slot]) > 0);
}

export function whatIsShortFor(box: OwnedTackle[], kit: RodKit): string[] {
	return SetupSlots.filter((slot) => quantityOwned(box, kit[slot].id) <= 0).map((slot) => kit[slot].label);
}

export function isSpoiled(owned: OwnedTackle, now: Date) {
	return owned.spoilsAt !== null && new Date(owned.spoilsAt).getTime() < now.getTime();
}
