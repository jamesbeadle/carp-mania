import type { BountyKind } from '$lib/domain/bounties/bountyKinds';
import type { DifficultyBand } from '$lib/domain/bounties/difficultyBand';
import type { PrizeKind } from '$lib/domain/bounties/prizeTackle';

export type BountyStatus = 'open' | 'won' | 'unclaimed';

export interface BountyCard {
	id: string;
	lakeId: string;
	lakeName: string;
	kind: BountyKind;
	band: DifficultyBand;
	swimId: string | null;
	swimName: string | null;
	targetCarpId: string | null;
	targetCarpName: string | null;
	targetWeightLb: number | null;
	sponsorBrand: string;
	isOwnersOwn: boolean;
	prizeKind: PrizeKind;
	prizeMoney: number;
	prizeBrand: string | null;
	opensAt: string;
	endsAt: string;
	status: BountyStatus;
	winnerId: string | null;
	winnerName: string | null;
}

export interface BountyWon {
	kind: BountyKind;
	prizeKind: PrizeKind;
	prizeMoney: number;
}
