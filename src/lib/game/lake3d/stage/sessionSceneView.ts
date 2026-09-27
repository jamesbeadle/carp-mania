import { fightSecondsFor } from '$lib/domain/fishing/fight';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { Carp } from '$lib/domain/types';
import type { FightState } from '../../session/fightState.svelte';
import type { LandedFish } from '../../session/landFish';
import type { SessionState } from '../../session/sessionState.svelte';
import type { FishOnTheLine, FishOnTheMat, SceneView } from './sceneView';

function fishOfCarp(carp: Carp): FishOnTheMat {
	return { strain: carp.strain, weightLb: Number(carp.weight_lb) };
}

function fishOnTheLine(fight: FightState | null, rodIndex: number): FishOnTheLine | null {
	if (!fight) return null;
	const fish = fishOfCarp(fight.carp);
	const progress = 1 - fight.secondsRemaining / fightSecondsFor(fish.weightLb);
	return { ...fish, rodIndex, progress, isRunning: fight.isRunning, tension: fight.tension };
}

function fishOnTheMat(landed: LandedFish | null) {
	return landed ? fishOfCarp(landed.carp) : null;
}

export function sceneViewOf(session: SessionState, hoveredSwimId: string | null, showingAt: LayoutPoint[]): SceneView {
	const { swim, rods, phase } = session;
	const fightingRod = rods.find((rod) => rod.phase === 'fighting');
	return {
		phase,
		swimId: swim?.id ?? null,
		hoveredSwimId,
		isPickingSwim: session.isPickingASwimToMoveTo,
		rods,
		fight: fishOnTheLine(session.fight, fightingRod?.index ?? 0),
		landed: fishOnTheMat(phase === 'landed' ? session.lastLanded : null),
		showingAt
	};
}
