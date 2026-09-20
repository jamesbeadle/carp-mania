<script lang="ts">
	import { TierLabels } from '$lib/domain/tackle/brands';
	import type { Lake } from '$lib/domain/types';

	let { lake }: { lake: Lake } = $props();

	const hasShop = $derived(lake.layout.facilities.includes('tackle_shop'));
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-carbon-700/60 bg-carbon-900/60 p-4">
	<div class="min-w-0 flex-1">
		<p class="stat-label">The shop</p>
		{#if hasShop}
			<p class="flex flex-wrap items-baseline gap-x-2"><span class="font-display text-2xl leading-none font-extrabold text-volt-300 italic">{TierLabels[lake.shop_tier]}</span><span class="text-xs text-mist-400">tier and below</span></p>
		{:else}
			<p class="flex flex-wrap items-baseline gap-x-2"><span class="font-display text-2xl leading-none font-extrabold text-mist-100 italic">None</span><span class="text-xs text-mist-400">the world counter stocks to the Specialist tier</span></p>
		{/if}
	</div>
	{#if hasShop}<a href="/lakes/{lake.id}/shop" class="button-secondary inline-block px-3 py-1 text-base">Buy on site</a>{/if}
</div>
