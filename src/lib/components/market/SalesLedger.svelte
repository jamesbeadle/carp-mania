<script lang="ts">
	import type { CarpTransfer } from '$lib/domain/marketTypes';
	import { formatWhen } from '$lib/format/dates';
	import { formatMoney } from '$lib/format/money';

	let { sales, purchases, lakeNames }: { sales: CarpTransfer[]; purchases: CarpTransfer[]; lakeNames: Record<string, string> } = $props();

	const PrivateWater = 'a private water';
	const lakeName = (lakeId: string | null) => (lakeId ? (lakeNames[lakeId] ?? PrivateWater) : PrivateWater);
	const netOf = (sale: CarpTransfer) => Number(sale.price) - Number(sale.commission);
	const allInOf = (purchase: CarpTransfer) => Number(purchase.price) + Number(purchase.transport_cost);
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<section class="panel">
		<h3 class="mb-3 text-xl text-volt-300">Sold from here</h3>
		{#if sales.length === 0}
			<p class="text-sm text-mist-400">Nothing sold yet.</p>
		{:else}
			<ul class="divide-y divide-carbon-700/60 text-sm">
				{#each sales as sale (sale.id)}
					<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
						{#if sale.carp_id}<a href="/carp/{sale.carp_id}" class="text-mist-100 hover:underline">{sale.carp_name}</a>{:else}<span class="text-mist-100">{sale.carp_name}</span>{/if}
						<span class="text-mist-400">to {lakeName(sale.to_lake_id)}</span>
						<span class="text-volt-300">{formatMoney(sale.price)}</span>
						<span class="text-mist-400">· {formatMoney(netOf(sale))} after commission</span>
						<span class="ml-auto text-xs text-mist-400">{formatWhen(sale.departed_at)}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
	<section class="panel">
		<h3 class="mb-3 text-xl text-volt-300">Bought in</h3>
		{#if purchases.length === 0}
			<p class="text-sm text-mist-400">Nothing bought from another water yet.</p>
		{:else}
			<ul class="divide-y divide-carbon-700/60 text-sm">
				{#each purchases as purchase (purchase.id)}
					<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
						{#if purchase.carp_id}<a href="/carp/{purchase.carp_id}" class="text-mist-100 hover:underline">{purchase.carp_name}</a>{:else}<span class="text-mist-100">{purchase.carp_name}</span>{/if}
						<span class="text-mist-400">from {lakeName(purchase.from_lake_id)}</span>
						<span class="text-volt-300">{formatMoney(allInOf(purchase))}</span>
						<span class="text-mist-400">· {formatMoney(purchase.transport_cost)} transport · {Math.round(Number(purchase.distance_km))} km</span>
						<span class="ml-auto text-xs text-mist-400">
							arrives {formatWhen(purchase.arrives_at)}{#if purchase.quarantine_until} · quarantine until {formatWhen(purchase.quarantine_until)}{/if}
						</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
