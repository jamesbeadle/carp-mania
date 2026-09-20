<script lang="ts">
	import { streakBiteFactor, streakWords } from '$lib/domain/fishing/streak';

	let { streakDays }: { streakDays: number } = $props();

	const factor = $derived(streakBiteFactor(streakDays));
	const hasABonus = $derived(factor > 1);
</script>

<span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-display text-xs font-bold tracking-wide whitespace-nowrap uppercase" class:border-volt-500-60={hasABonus} class:text-volt-300={hasABonus} class:border-carbon-600={!hasABonus} class:text-mist-400={!hasABonus} title={streakWords(streakDays)}>
	<span aria-hidden="true">🔥</span>
	Day {streakDays}{#if hasABonus}<span class="text-mist-200">· bites ×{factor.toFixed(1)}</span>{/if}
</span>

<style>
	.border-volt-500-60 {
		border-color: color-mix(in srgb, var(--color-volt-500) 60%, transparent);
	}
</style>
