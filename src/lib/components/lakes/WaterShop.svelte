<script lang="ts">
	import { TierLabels } from '$lib/domain/tackle/brands';
	import type { Lake } from '$lib/domain/types';

	let { lake }: { lake: Lake } = $props();

	const hasShop = $derived(lake.layout.facilities.includes('tackle_shop'));
</script>

<div class="rounded-xl border border-carbon-700/60 bg-carbon-900/60 p-4">
	<p class="stat-label">The shop</p>
	{#if hasShop}
		<p class="text-lg text-volt-300">Stocks up to the {TierLabels[lake.shop_tier]} tier</p>
		<p class="mt-1 text-xs text-mist-400">A brand will not put its name in a badly run fishery: the tier follows reputation and water quality.</p>
		<a href="/lakes/{lake.id}/shop" class="button-secondary mt-2 inline-block px-3 py-1 text-base">Buy on site</a>
	{:else}
		<p class="text-sm text-mist-200">No tackle shop on this water — the world counter stocks up to the Specialist tier.</p>
	{/if}
</div>
