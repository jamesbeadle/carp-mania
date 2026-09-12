import type { CarpMemorial } from '$lib/domain/memorialTypes';
import type { CarpTransfer } from '$lib/domain/marketTypes';
import type { Catch } from '$lib/domain/types';

export interface MemorialDossier {
	memorial: CarpMemorial;
	catches: Catch[];
	transfers: CarpTransfer[];
	lakeNames: Record<string, string>;
	bestEverLb: number;
}
