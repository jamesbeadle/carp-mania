import type { BaitBrandName, BrandName, Tier } from '$lib/domain/tackle/brands';
import type { TackleItem } from '$lib/domain/tackle/tackleItem';

export interface Shelf {
	brand: BrandName | BaitBrandName;
	label: string;
	tier: Tier;
	story: string;
	minimumRating: number;
	isUnlocked: boolean;
	items: TackleItem[];
}

export interface TackleShelves {
	shelves: Shelf[];
	rating: number;
	stocksUpTo: Tier;
	money: number;
}
