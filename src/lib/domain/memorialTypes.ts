import type { CarpOrigin, CarpStrain } from './types';

export type DeathCause = 'pike' | 'old_age';

export interface CarpMemorial {
	id: string;
	lake_id: string | null;
	lake_name: string;
	name: string;
	strain: CarpStrain;
	weight_lb: number;
	age_years: number;
	origin: CarpOrigin;
	origin_lake_id: string | null;
	fame: number;
	times_caught: number;
	died_at: string;
	death_cause: DeathCause;
}

export const DeathCauseWords: Record<DeathCause, string> = { pike: 'taken by the pike', old_age: 'old age' };
