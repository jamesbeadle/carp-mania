<script lang="ts">
	import type { SessionState } from '$lib/game/session/sessionState.svelte';

	let { session }: { session: SessionState } = $props();

	const uncastCount = $derived(session.rods.filter((rod) => rod.phase === 'idle').length);
	const prompt = $derived(promptFor(session.phase, uncastCount, session.rods.length));

	function promptFor(phase: SessionState['phase'], uncast: number, rodCount: number) {
		if (phase === 'choose_swim') return 'Pick a swim — click one of the pegs on the bank';
		if (phase !== 'fishing') return null;
		if (uncast === rodCount) return 'Click the water to cast your first rod';
		if (uncast > 0) return `Click the water to cast rod ${rodCount - uncast + 1} of ${rodCount}`;
		return 'Rods out — wait for the bite alarm, then strike';
	}
</script>

{#if prompt}
	<div class="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full border border-volt-500/60 bg-carbon-950/85 px-5 py-2 font-display text-lg font-bold tracking-wide text-volt-300 uppercase backdrop-blur">
		{prompt}
	</div>
{/if}
