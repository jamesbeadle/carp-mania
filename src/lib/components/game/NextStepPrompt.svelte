<script lang="ts">
	import { PickASwimPrompt } from '$lib/game/session/movingSwim';
	import { nextRodToCast } from '$lib/game/session/sessionFlow';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import { pointerWords } from '$lib/game/stage/pointerWords';

	let { session, isDocked = false }: { session: SessionState; isDocked?: boolean } = $props();

	const prompt = $derived(promptFor(session));
	const words = $derived(prompt ? pointerWords(prompt) : null);

	function promptFor(current: SessionState) {
		if (current.phase === 'choose_swim') return 'Pick a swim — click one of the pegs on the bank';
		if (current.phase !== 'fishing' || current.bite) return null;
		if (current.isPickingASwimToMoveTo) return PickASwimPrompt;
		const next = nextRodToCast(current);
		if (!next) return 'Rods out — wait for the bite alarm, then strike';
		const isNothingOutYet = current.rods.every((rod) => rod.phase === 'idle');
		if (isNothingOutYet) return 'Click the water to cast your first rod';
		return `Click the water to cast rod ${next.index + 1}`;
	}
</script>

{#if words}
	<div class={['pointer-events-none rounded-full border border-volt-500/60 bg-carbon-950/85 px-5 py-2 font-display text-lg font-bold tracking-wide text-volt-300 uppercase backdrop-blur', isDocked ? 'text-center' : 'absolute top-3 left-1/2 -translate-x-1/2']}>
		{words}
	</div>
{/if}
