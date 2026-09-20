<script lang="ts">
	import { PickASwimPrompt } from '$lib/game/session/movingSwim';
	import { nextRodToCast } from '$lib/game/session/sessionFlow';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import { pointerWords } from '$lib/game/stage/pointerWords';

	let { session }: { session: SessionState } = $props();

	const prompt = $derived(promptFor(session));
	const words = $derived(prompt ? pointerWords(prompt) : null);

	function promptFor(current: SessionState) {
		if (current.phase === 'choose_swim') return 'Pick a swim — click a peg on the bank or a name';
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
	<div class="short:py-1 short:text-sm rounded-2xl border border-volt-500/60 bg-carbon-950/85 px-4 py-2 text-center font-display text-base font-bold tracking-wide text-volt-300 uppercase">
		{words}
	</div>
{/if}
