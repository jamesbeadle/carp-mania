<script lang="ts">
	import type { ItemEffect } from '$lib/domain/tackle/itemEffects';
	import StatBar from '../stats/StatBar.svelte';

	let { effects }: { effects: ItemEffect[] } = $props();
</script>

<dl class="space-y-1.5">
	{#each effects as one (one.key)}
		<div title={one.words}>
			<div class="flex items-baseline justify-between gap-2 text-xs"><dt class="text-mist-400">{one.label}</dt><dd class="tabular-nums text-mist-200">{Math.round(one.share * 100)}</dd></div>
			<StatBar share={one.share} />
		</div>
	{/each}
</dl>
