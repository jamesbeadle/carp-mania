import type { RodSetup } from '$lib/domain/tackle/rodSetup';
import type { OwnedTackle } from '$lib/domain/tackle/tackleBox';

export interface TackleBox {
	owned: OwnedTackle[];
	savedRods: RodSetup[];
	rating: number;
}
