import { BaitOnSale } from './catalogue/baitOnSale';
import { LeadsOnSale, RigsOnSale, TubingOnSale } from './catalogue/endTackleOnSale';
import { HooksOnSale } from './catalogue/hooksOnSale';
import { LinesOnSale } from './catalogue/linesOnSale';
import { ReelsOnSale } from './catalogue/reelsOnSale';
import { RodsOnSale } from './catalogue/rodsOnSale';
import { PrizeOnlyTackle } from './catalogue/prizeOnly';
import { prototypeItem } from './prototypes';
import type { TackleKind } from './kinds';
import type { ItemOfKind, TackleItem } from './tackleItem';

export const TackleOnSale: TackleItem[] = [...RodsOnSale, ...ReelsOnSale, ...LinesOnSale, ...HooksOnSale, ...RigsOnSale, ...LeadsOnSale, ...TubingOnSale, ...BaitOnSale];
export const TackleCatalogue: TackleItem[] = [...TackleOnSale, ...PrizeOnlyTackle];

const ItemsById = new Map(TackleCatalogue.map((item) => [item.id, item]));

export function tackleItem(id: string): TackleItem | null {
	return ItemsById.get(id) ?? prototypeItem(id);
}

export function tackleItemOfKind<Kind extends TackleKind>(id: string, kind: Kind): ItemOfKind<Kind> | null {
	const item = tackleItem(id);
	return item?.kind === kind ? (item as ItemOfKind<Kind>) : null;
}

export function itemsOfKind<Kind extends TackleKind>(kind: Kind): ItemOfKind<Kind>[] {
	return TackleCatalogue.filter((item): item is ItemOfKind<Kind> => item.kind === kind);
}

export function isCatalogueId(id: unknown): id is string {
	return typeof id === 'string' && tackleItem(id) !== null;
}
