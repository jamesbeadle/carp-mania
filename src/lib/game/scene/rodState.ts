import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { Terrain } from '$lib/domain/layout/terrainAt';
import { kitFor, type RodKit, type RodSetup } from '$lib/domain/tackle/rodSetup';
import { toFraction, type Point } from './lakeShape';

export type RodPhase = 'idle' | 'cast' | 'biting' | 'fighting';

export interface RodOnBank {
	index: number;
	setup: RodSetup;
	kit: RodKit;
	phase: RodPhase;
	baitPoint: Point | null;
	terrain: Terrain | null;
	hoursCast: number;
}

export interface CastRod extends RodOnBank {
	baitPoint: Point;
	terrain: Terrain;
}

export function restingRod(index: number, setup: RodSetup): RodOnBank {
	return { index, setup, kit: kitFor(setup), phase: 'idle', baitPoint: null, terrain: null, hoursCast: 0 };
}

export function isCastOut(rod: RodOnBank): rod is CastRod {
	return rod.phase !== 'idle' && rod.baitPoint !== null && rod.terrain !== null;
}

export function castPointOf(rod: CastRod): LayoutPoint {
	return toFraction(rod.baitPoint);
}

export function rodCastingNext(rods: RodOnBank[]): RodOnBank | null {
	return rods.find((rod) => rod.phase === 'idle') ?? null;
}

export function isCastingNext(rod: RodOnBank, rods: RodOnBank[]) {
	return rodCastingNext(rods)?.index === rod.index;
}

export function bringRodIn(rod: RodOnBank) {
	rod.phase = 'idle';
	rod.baitPoint = null;
	rod.terrain = null;
}
