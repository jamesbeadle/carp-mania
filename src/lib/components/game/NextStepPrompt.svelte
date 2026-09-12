<script lang="ts">
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import { pointerWords } from '$lib/game/stage/pointerWords';

	let { session, isDocked = false }: { session: SessionState; isDocked?: boolean } = $props();

	const uncastCount = $derived(session.rods.filter((rod) => rod.phase === 'idle').length);
	const prompt = $derived(promptFor(session.phase, uncastCount, session.rods.length));
	const words = $derived(prompt ? pointerWords(prompt) : null);

	function promptFor(phase: SessionState['phase'], uncast: number, rodCount: number) {
		if (phase === 'choose_swim') return 'Pick a swim — click one of the pegs on the bank';
		if (phase !== 'fishing') return null;
		if (uncast === rodCount) return 'Click the water to cast your first rod';
		if (uncast > 0) return `Click the water to cast rod ${rodCount - uncast + 1} of ${rodCount}`;
		return 'Rods out — wait for the bite alarm, then strike';
	}
</script>

{#if words}
	<div class={['pointer-events-none rounded-full border border-volt-500/60 bg-carbon-950/85 px-5 py-2 font-display text-lg font-bold tracking-wide text-volt-300 uppercase backdrop-blur', isDocked ? 'text-center' : 'absolute top-3 left-1/2 -translate-x-1/2']}>
		{words}
	</div>
{/if}
