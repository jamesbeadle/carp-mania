import type { RegionCode } from '$lib/domain/world/regionCodes';

export interface WorldPin {
	id: string;
	name: string;
	ownerName: string;
	region: RegionCode;
	latitude: number;
	longitude: number;
	reputation: number;
	heaviestLb: number;
	acres: number;
	dayTicketFee: number;
	anglersOnBankNow: number;
}
