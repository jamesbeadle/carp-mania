<script lang="ts">
	import { SwimMoveWords } from '$lib/domain/fishing/movingSwims';
	import { canMoveSwim } from '$lib/game/session/movingSwim';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';

	interface Props {
		session: SessionState;
		isDocked?: boolean;
		onSetOff: () => void;
		onStayPut: () => void;
	}

	let { session, isDocked = false, onSetOff, onStayPut }: Props = $props();

	const MoveKey = 'm';
	const StayKey = 'Escape';
	const isShown = $derived(canMoveSwim(session));
	const isPicking = $derived(session.isPickingASwimToMoveTo);

	function answerTheKeys(event: KeyboardEvent) {
		if (!isShown || event.target instanceof HTMLInputElement) return;
		if (event.key.toLowerCase() === MoveKey && !isPicking) return onSetOff();
		if (event.key === StayKey && isPicking) return onStayPut();
	}
</script>

<svelte:window onkeydown={answerTheKeys} />

{#if isShown}
	<div class={['pointer-events-auto', isDocked ? 'flex' : 'absolute top-3 right-3']}>
		{#if isPicking}
			<button class="button-secondary w-full py-1.5 text-base" onclick={onStayPut}>Stay put</button>
		{:else}
			<button class="button-secondary w-full py-1.5 text-base" onclick={onSetOff} title="Bring the rods in and walk to another peg — {SwimMoveWords.Duration} to pack up and walk round">Move swim</button>
		{/if}
	</div>
{/if}
