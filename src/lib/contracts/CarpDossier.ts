import type { CarpTransfer } from '$lib/domain/marketTypes';
import type { Carp, Catch } from '$lib/domain/types';
import type { RegionCode } from '$lib/domain/world/regionCodes';

export interface DossierLake {
	id: string;
	name: string;
	region: RegionCode;
	ownerId: string;
	ownerName: string;
}

export interface GrowthPoint {
	at: string;
	weightLb: number;
}

export interface CarpDossier {
	carp: Carp;
	lake: DossierLake;
	originLakeName: string | null;
	catches: Catch[];
	transfers: CarpTransfer[];
	lakeNames: Record<string, string>;
	guidePrice: number;
	dealerOffer: number;
	bestEverLb: number;
	growth: GrowthPoint[];
	openListingId: string | null;
	isMine: boolean;
}
