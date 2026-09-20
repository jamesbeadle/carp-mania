import type { BaitName } from './baits';
import type { BaitBrandName, BrandName, Tier } from './brands';
import type { HookStats } from './hooks';
import type { TackleKind } from './kinds';
import type { LineStats } from './lines';
import type { ReelKind } from './reels';
import type { RigName } from './rigs';
import type { RodStats } from './rods';
import type { TubingColour } from './tubing';

export interface ItemBase {
	id: string;
	brand: BrandName | BaitBrandName;
	tier: Tier;
	label: string;
	price: number;
	minimumRating: number;
	packQuantity: number;
}

export interface BaitStats {
	kind: BaitName;
	appealFactor: number;
	keepsDays: number | null;
}

export type RodItem = ItemBase & { kind: 'rod'; rod: RodStats };
export type ReelItem = ItemBase & { kind: 'reel'; reel: ReelKind };
export type LineItem = ItemBase & { kind: 'line'; line: LineStats };
export type HookItem = ItemBase & { kind: 'hook'; hook: HookStats };
export type RigItem = ItemBase & { kind: 'rig'; rig: RigName };
export type LeadItem = ItemBase & { kind: 'lead' };
export type TubingItem = ItemBase & { kind: 'tubing'; tubing: TubingColour };
export type BaitItem = ItemBase & { kind: 'bait'; bait: BaitStats };

export type TackleItem = RodItem | ReelItem | LineItem | HookItem | RigItem | LeadItem | TubingItem | BaitItem;

export type ItemOfKind<Kind extends TackleKind> = Extract<TackleItem, { kind: Kind }>;

export const PackSizes = { Hooks: 10, Rigs: 5, Leads: 10, Tubing: 5, Bait: 100, One: 1 } as const;
