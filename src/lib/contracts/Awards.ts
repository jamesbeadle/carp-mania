import type { AwardKey, AwardTallies } from '$lib/domain/trophies/awards';
import type { AwardProgress } from '$lib/domain/trophies/awardProgress';

export interface AwardWon {
	key: AwardKey;
	wonAt: string;
	catchId: string | null;
}

export interface AwardsPage {
	won: AwardWon[];
	tallies: AwardTallies;
	next: AwardProgress[];
}
