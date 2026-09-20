import { hourAfterMovingSwim, SwimMoveWords } from '$lib/domain/fishing/movingSwims';
import type { Swim } from '$lib/domain/types';
import { bringRodIn } from '../scene/rodState';
import type { SessionState } from './sessionState.svelte';

export const PickASwimPrompt = `Pick a peg to move to — ${SwimMoveWords.Duration} to walk round`;

export function canMoveSwim(session: SessionState) {
	return session.phase === 'fishing' && session.bite === null && session.swim !== null;
}

export function startPickingASwim(session: SessionState) {
	if (!canMoveSwim(session)) return;
	session.isPickingASwimToMoveTo = true;
	session.notice = null;
}

export function stayPut(session: SessionState) {
	session.isPickingASwimToMoveTo = false;
}

export function moveToSwim(session: SessionState, swim: Swim) {
	if (!canMoveSwim(session) || !session.isPickingASwimToMoveTo) return false;
	session.isPickingASwimToMoveTo = false;
	if (swim.id === session.swim?.id) return false;
	for (const rod of session.rods) bringRodIn(rod);
	session.swim = swim;
	session.hour = hourAfterMovingSwim(session.hour, session.window.toHour);
	session.notice = `Moved to ${swim.name} — ${SwimMoveWords.Duration} gone. Click the water to cast again.`;
	return true;
}
