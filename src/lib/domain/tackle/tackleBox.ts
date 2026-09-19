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
	isSpoiled: boolean;
}

export function ownedItemsIn(owned: OwnedTackle[], now: Date = new Date()): OwnedItem[] {
	return owned.flatMap((line) => {
		const item = tackleItem(line.itemId);
		return item ? [{ ...line, item, isSpoiled: isSpoiled(line, now) }] : [];
	});
}

export function ownedOfKind(box: OwnedItem[], kind: TackleKind) {
	const ofKind = box.filter((owned) => owned.item.kind === kind && !owned.isSpoiled);
	return ofKind.filter((owned) => owned.quantity > 0);
}

export function quantityOwned(box: OwnedTackle[], itemId: string) {
	return box.find((owned) => owned.itemId === itemId)?.quantity ?? 0;
}

export function isSetupOwned(box: OwnedTackle[], setup: RodSetup, now: Date = new Date()) {
	return SetupSlots.every((slot) => isUsable(box, setup[slot], now));
}

function isUsable(box: OwnedTackle[], itemId: string, now: Date) {
	const owned = box.find((line) => line.itemId === itemId);
	return owned !== undefined && owned.quantity > 0 && !isSpoiled(owned, now);
}

export function whatIsShortFor(box: OwnedTackle[], kit: RodKit): string[] {
	return SetupSlots.filter((slot) => quantityOwned(box, kit[slot].id) <= 0).map((slot) => kit[slot].label);
}

export function isSpoiled(owned: OwnedTackle, now: Date) {
	return owned.spoilsAt !== null && new Date(owned.spoilsAt).getTime() < now.getTime();
}
