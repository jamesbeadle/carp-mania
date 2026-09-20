import type { FarmPack } from '$lib/domain/market/farmPacks';
import type { Farm } from '$lib/domain/market/farms';
import type { TransportQuote } from '$lib/domain/market/transport';

export interface PackOnShelf extends FarmPack {
	left: number;
}

export interface FarmOnShelf {
	farm: Farm;
	packs: PackOnShelf[];
	quote: TransportQuote | null;
}

export interface FarmShelves {
	farms: FarmOnShelf[];
	money: number;
	waterName: string | null;
	roomLeftLb: number | null;
}
