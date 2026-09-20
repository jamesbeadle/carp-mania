<script lang="ts">
	import type { Swim } from '$lib/domain/types';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import KeyHints from './KeyHints.svelte';
	import MoveSwimButton from './MoveSwimButton.svelte';
	import NextStepPrompt from './NextStepPrompt.svelte';
	import RodStatusBar from './RodStatusBar.svelte';
	import SessionNotice from './SessionNotice.svelte';
	import SwimPicker from './SwimPicker.svelte';

	interface Props {
		session: SessionState;
		swims: Swim[];
		isBesideTheWater: boolean;
		onPickSwim: (swim: Swim) => void;
		onReelIn: (rodIndex: number) => void;
		onSetOff: () => void;
		onStayPut: () => void;
	}

	let { session, swims, isBesideTheWater, onPickSwim, onReelIn, onSetOff, onStayPut }: Props = $props();

	const isPickingASwim = $derived(session.phase === 'choose_swim' || session.isPickingASwimToMoveTo);
	const hasRodsOut = $derived(session.rods.length > 0 && !isPickingASwim);
	const hasNotice = $derived(session.notice !== null && session.bite === null);
</script>

<div class="short:gap-2 short:p-2 flex min-h-full flex-col gap-3 p-3">
	<NextStepPrompt {session} />
	{#if hasNotice && session.notice}<SessionNotice notice={session.notice} />{/if}
	{#if isPickingASwim}<SwimPicker {swims} selectedSwimId={session.swim?.id ?? null} {isBesideTheWater} onPick={onPickSwim} />{/if}
	{#if hasRodsOut}<RodStatusBar rods={session.rods} isWide={isBesideTheWater} {onReelIn} />{/if}
	<MoveSwimButton {session} {onSetOff} {onStayPut} />
	{#if isBesideTheWater}<div class="key-hints mt-auto pt-3"><KeyHints /></div>{/if}
</div>

<style>
	.key-hints {
		display: none;
	}
	@media (min-width: 1024px) and (min-height: 720px) {
		.key-hints {
			display: block;
		}
	}
</style>
