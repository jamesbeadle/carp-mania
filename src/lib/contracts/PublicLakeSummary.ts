import type { ListPage } from '$lib/domain/lists/paging';
import type { WaterFilters } from '$lib/domain/lists/waterFilters';
import type { Lake } from '$lib/domain/types';

export interface PublicLakeSummary {
	lake: Lake;
	ownerName: string;
	carpCount: number;
	heaviestCarpLb: number;
	swimCount: number;
	fromPrice: number;
}

export interface WatersToFish {
	page: ListPage<PublicLakeSummary>;
	filters: WaterFilters;
}
