import type { SessionState } from './sessionState.svelte';

const TickMilliseconds = 100;
const MillisecondsPerSecond = 1000;

export function startTicking(session: SessionState) {
	let last = performance.now();
	const ticking = setInterval(() => {
		const now = performance.now();
		session.tick((now - last) / MillisecondsPerSecond);
		last = now;
	}, TickMilliseconds);
	return () => clearInterval(ticking);
}
