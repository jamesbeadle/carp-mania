import type { RodSetup } from '$lib/domain/tackle/rodSetup';

export interface SaveRodSetOrder {
	name: string;
	rods: RodSetup[];
}

export interface RodSetSaved {
	id: string;
	name: string;
	lastUsedAt: string;
}
