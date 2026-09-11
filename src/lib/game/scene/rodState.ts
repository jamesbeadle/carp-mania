import type { RodSetup } from '$lib/domain/tackle/rodSetup';
import type { Point } from './lakeShape';

export type RodPhase = 'idle' | 'cast' | 'biting' | 'fighting';

export interface RodOnBank {
	index: number;
	setup: RodSetup;
	phase: RodPhase;
	baitPoint: Point | null;
}

export function restingRod(index: number, setup: RodSetup): RodOnBank {
	return { index, setup, phase: 'idle', baitPoint: null };
}
