import type { Lake } from '$lib/domain/types';

export interface PublicLakeSummary {
	lake: Lake;
	ownerName: string;
	carpCount: number;
	heaviestCarpLb: number;
}
