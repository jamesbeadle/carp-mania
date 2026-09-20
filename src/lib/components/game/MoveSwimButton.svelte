<script lang="ts">
	import { SwimMoveWords } from '$lib/domain/fishing/movingSwims';
	import { canMoveSwim } from '$lib/game/session/movingSwim';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';

	interface Props {
		session: SessionState;
		onSetOff: () => void;
		onStayPut: () => void;
	}

	let { session, onSetOff, onStayPut }: Props = $props();

	const MoveKey = 'm';
	const StayKey = 'Escape';
	const isShown = $derived(canMoveSwim(session));
	const isPicking = $derived(session.isPickingASwimToMoveTo);
	const walkWords = `Bring the rods in and walk to another peg — ${SwimMoveWords.Duration} to pack up and walk round`;

	function answerTheKeys(event: KeyboardEvent) {
		if (!isShown || event.target instanceof HTMLInputElement) return;
		if (event.key.toLowerCase() === MoveKey && !isPicking) return onSetOff();
		if (event.key === StayKey && isPicking) return onStayPut();
	}
</script>

<svelte:window onkeydown={answerTheKeys} />

{#if isShown && isPicking}
	<button class="button-secondary w-full py-2 text-base" onclick={onStayPut}>Stay put</button>
{:else if isShown}
	<button class="button-secondary w-full py-2 text-base" onclick={onSetOff} title={walkWords}>Move swim</button>
{/if}
