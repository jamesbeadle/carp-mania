<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { GroundworksQuote } from '$lib/contracts/GroundworksQuote';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { orderWorks } from '$lib/game/builder/orderWorks';
	import { formatMoney } from '$lib/format/money';

	let { builder, quote, money }: { builder: BuilderState; quote: GroundworksQuote; money: number } = $props();

	let isOrdering = $state(false);
	const canAfford = $derived(money >= quote.cost);
	const canOrder = $derived(builder.isReadyToOrder && quote.failures.length === 0 && canAfford && !isOrdering);

	async function order() {
		const draft = builder.draft;
		if (!draft || !canOrder) return;
		const days = quote.days;
		isOrdering = true;
		const outcome = await orderWorks(draft);
		isOrdering = false;
		if (outcome.message !== undefined) return (builder.notice = outcome.message);
		builder.clear();
		builder.notice = `Ordered — the crew is on it for ${days} ${days === 1 ? 'day' : 'days'}`;
		await invalidateAll();
	}
</script>

<div class="space-y-3 border-t border-carbon-700 pt-3">
	<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
		<dt class="stat-label">Cost</dt>
		<dd class="text-right text-lg text-volt-300">{formatMoney(quote.cost)}</dd>
		<dt class="stat-label">Takes</dt>
		<dd class="text-right text-mist-100">{quote.days} {quote.days === 1 ? 'day' : 'days'}</dd>
	</dl>
	<ul class="space-y-0.5 text-sm text-mist-200">
		{#each quote.effects as effect (effect)}
			<li>{effect}</li>
		{/each}
	</ul>
	{#if quote.failures.length > 0}
		<ul class="space-y-0.5 text-sm text-danger-400">
			{#each quote.failures as failure (failure)}
				<li>{failure}</li>
			{/each}
		</ul>
	{/if}
	{#if !canAfford}<p class="text-sm text-danger-400">That is more than the {formatMoney(money)} you have.</p>{/if}
	<div class="flex gap-2">
		<button class="button-primary flex-1 px-2 text-base" disabled={!canOrder} onclick={order}>Order works {formatMoney(quote.cost)}</button>
		<button class="button-secondary px-3 text-base" onclick={() => builder.clear()}>Cancel</button>
	</div>
</div>
