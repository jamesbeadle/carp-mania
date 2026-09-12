<script lang="ts">
	import { honourKindsOf, HonourWords, isARecord, type Honours } from '$lib/domain/fishing/honours';
	import { buzzForAnHonour } from '$lib/game/session/haptics';
	import { sound } from '$lib/game/sound/soundEngine.svelte';

	let { honours }: { honours: Honours } = $props();

	const kinds = $derived(honourKindsOf(honours));

	$effect(() => {
		if (kinds.length === 0) return;
		sound.play(isARecord(honours) ? 'record' : 'personal_best');
		buzzForAnHonour();
	});
</script>

{#if kinds.length > 0}
	<div class="flex flex-wrap justify-center gap-2">
		{#each kinds as kind, index (kind)}
			<span class="ribbon rounded-full border-2 px-4 py-1 font-display text-lg font-extrabold tracking-wide uppercase italic" class:record={kind !== 'personal_best'} class:personal={kind === 'personal_best'} style="animation-delay: {index * 0.15}s">
				{HonourWords[kind]}!
			</span>
		{/each}
	</div>
{/if}

<style>
	.ribbon {
		animation: ribbon-in 0.5s cubic-bezier(0.2, 1.4, 0.4, 1) both;
	}
	.record {
		border-color: var(--color-volt-400);
		background: rgba(62, 232, 58, 0.18);
		color: var(--color-volt-300);
		box-shadow: 0 0 24px rgba(62, 232, 58, 0.35);
	}
	.personal {
		border-color: var(--color-surge-400);
		background: rgba(31, 211, 255, 0.14);
		color: var(--color-surge-300);
		box-shadow: 0 0 24px rgba(31, 211, 255, 0.3);
	}
	@keyframes ribbon-in {
		from {
			opacity: 0;
			transform: scale(0.4) rotate(-6deg);
		}
		to {
			opacity: 1;
			transform: scale(1) rotate(0deg);
		}
	}
</style>
