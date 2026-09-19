import type { Bailiff } from '$lib/domain/bailiffs/bailiffTeam';
import type { Candidate } from '$lib/domain/bailiffs/candidates';

export interface BailiffsPanel {
	team: Bailiff[];
	candidates: Candidate[];
	cap: number;
}
