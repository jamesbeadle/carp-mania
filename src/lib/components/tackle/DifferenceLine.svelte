<script lang="ts">
	import { differencesFrom } from '$lib/domain/tackle/itemEffects';
	import type { TackleItem } from '$lib/domain/tackle/tackleItem';

	let { item, inUse }: { item: TackleItem; inUse: TackleItem | null } = $props();

	const isInUse = $derived(inUse?.id === item.id);
	const differences = $derived(differencesFrom(item, inUse));
	const signed = (percent: number) => (percent > 0 ? `+${percent}` : `${percent}`);
</script>

{#if isInUse}
	<p class="text-xs text-volt-300">What you fish with now</p>
{:else if differences.length > 0 && inUse}
	<p class="flex flex-wrap gap-x-2 text-xs">
		{#each differences as difference (difference.label)}
			<span class:text-volt-300={difference.percent > 0} class:text-danger-400={difference.percent < 0}>{difference.label} {signed(difference.percent)}%</span>
		{/each}
		<span class="text-mist-400">vs your {inUse.label}</span>
	</p>
{/if}
