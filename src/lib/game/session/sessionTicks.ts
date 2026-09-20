import { FishingDay } from '$lib/domain/fishing/sessionClock';
import { strikeWindowFor } from '$lib/domain/fishing/strikeWindow';
import { bringRodIn, isCastOut } from '../scene/rodState';
import type { SessionState } from './sessionState.svelte';

const TooSlow = 'Too slow — the fish spat the bait out.';

export function advanceTheSession(session: SessionState, secondsElapsed: number) {
	if (session.phase === 'landed') return void (session.secondsSinceTheMat += secondsElapsed);
	if (session.phase !== 'fishing') return;
	const hoursElapsed = secondsElapsed / FishingDay.RealSecondsPerFishingHour;
	session.hour += hoursElapsed;
	for (const rod of session.rods) if (rod.phase !== 'idle') rod.hoursCast += hoursElapsed;
	if (session.isDayOver) return endTheDay(session);
	if (session.bite) return countDownTheBite(session, secondsElapsed);
	fireTheFirstDueBite(session);
}

function fireTheFirstDueBite(session: SessionState) {
	for (const rod of session.rods) {
		if (rod.phase !== 'cast' || !isCastOut(rod)) continue;
		const due = session.roller.biteDueOn(rod, session.hour);
		if (!due) continue;
		rod.phase = 'biting';
		session.bite = { ...due, secondsLeft: strikeWindowFor(session.watercraft) };
		return;
	}
}

function countDownTheBite(session: SessionState, secondsElapsed: number) {
	if (!session.bite) return;
	session.bite.secondsLeft -= secondsElapsed;
	if (session.bite.secondsLeft > 0) return;
	session.rods[session.bite.rodIndex].phase = 'cast';
	session.bite = null;
	session.notice = TooSlow;
}

export function endTheDay(session: SessionState) {
	session.hour = session.window.toHour;
	session.bite = null;
	const baitFished = session.rods.map((rod) => ({ kind: 'bait_fished' as const, rodIndex: rod.index, castPoint: rod.baitPoint ?? { x: 0, y: 0 }, hoursFished: rod.hoursCast }));
	session.tackleLost = [...session.tackleLost, ...baitFished];
	for (const rod of session.rods) bringRodIn(rod);
	session.phase = 'day_over';
}
