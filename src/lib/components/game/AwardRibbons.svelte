<script lang="ts">
	import { AwardCatalogue, type AwardKey } from '$lib/domain/trophies/awards';
	import { sound } from '$lib/game/sound/soundEngine.svelte';

	let { awards }: { awards: AwardKey[] } = $props();

	const hasSomething = $derived(awards.length > 0);

	$effect(() => {
		if (hasSomething) sound.play('record');
	});
</script>

{#if hasSomething}
	<div class="flex flex-wrap justify-center gap-2">
		{#each awards as key, index (key)}
			<span class="award rounded-full border-2 px-4 py-1 font-display text-lg font-extrabold tracking-wide uppercase italic" style="animation-delay: {index * 0.15}s">
				Award: {AwardCatalogue[key].label}
			</span>
		{/each}
	</div>
{/if}

<style>
	.award {
		animation: award-in 0.5s ease-out both;
		border-color: var(--color-warning-500);
		background: color-mix(in srgb, var(--color-warning-500) 16%, transparent);
		color: var(--color-warning-500);
		box-shadow: 0 0 24px color-mix(in srgb, var(--color-warning-500) 30%, transparent);
	}
	@keyframes award-in {
		from {
			opacity: 0;
			transform: scale(0.4) rotate(6deg);
		}
		to {
			opacity: 1;
			transform: scale(1) rotate(0deg);
		}
	}
</style>
