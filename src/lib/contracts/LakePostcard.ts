import type { Carp, Lake, Swim } from '$lib/domain/types';
import type { RegionCode } from '$lib/domain/world/regionCodes';

export interface PostcardNumbers {
	reputation: number;
	acres: number;
	heaviestLb: number;
	dayTicketFee: number;
	listingCount: number;
	anglersOnBankNow: number;
	ownerName: string;
	ownerId: string;
	region: RegionCode;
}

export interface LakePostcard {
	lake: Lake;
	swims: Swim[];
	carp: Carp[];
	numbers: PostcardNumbers;
}
