import { FightStepSeconds } from '$lib/domain/fishing/fight';
import type { FightState } from './fightState.svelte';

const MillisecondsPerSecond = 1000;
const MostSecondsPerTick = 0.2;

export function startFightTicking(fight: FightState, onOutcome: () => void) {
	let last = performance.now();
	const ticking = setInterval(() => {
		const now = performance.now();
		fight.advance(Math.min(MostSecondsPerTick, (now - last) / MillisecondsPerSecond));
		last = now;
		if (!fight.outcome) return;
		clearInterval(ticking);
		onOutcome();
	}, FightStepSeconds * MillisecondsPerSecond);
	return () => clearInterval(ticking);
}
