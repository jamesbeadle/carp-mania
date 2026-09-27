import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { CarpStrain } from '$lib/domain/types';
import type { RodOnBank } from '../../scene/rodState';
import type { SessionPhase } from '../../session/sessionState.svelte';
import type { FightMoment } from '../fish/hookedFish';

export interface FishOnTheLine extends FightMoment {
	strain: CarpStrain;
	weightLb: number;
	rodIndex: number;
}

export interface FishOnTheMat {
	strain: CarpStrain;
	weightLb: number;
}

export interface SceneView {
	phase: SessionPhase;
	swimId: string | null;
	hoveredSwimId: string | null;
	isPickingSwim: boolean;
	rods: RodOnBank[];
	fight: FishOnTheLine | null;
	landed: FishOnTheMat | null;
	showingAt: LayoutPoint[];
}

export function isLookingOverTheLake(view: SceneView) {
	return view.phase === 'choose_swim' || view.isPickingSwim || view.swimId === null;
}
