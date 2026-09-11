<script lang="ts">
	import type { CarpTransfer, TransferKind } from '$lib/domain/marketTypes';
	import { formatWhen } from '$lib/format/dates';
	import { formatMoney } from '$lib/format/money';

	let { transfers, lakeNames }: { transfers: CarpTransfer[]; lakeNames: Record<string, string> } = $props();

	const UnknownWater = 'a private water';

	const TransferStories: Record<TransferKind, (fromLake: string, toLake: string) => string> = {
		farm_delivery: (_, toLake) => `Delivered by the fish farm to ${toLake}`,
		dealer_purchase: (fromLake) => `Sold to the dealer from ${fromLake}`,
		dealer_sale: (_, toLake) => `Bought from the dealer for ${toLake}`,
		sale: (fromLake, toLake) => `Sold from ${fromLake} to ${toLake}`
	};

	const lakeName = (lakeId: string | null) => (lakeId ? (lakeNames[lakeId] ?? UnknownWater) : UnknownWater);
	const story = (transfer: CarpTransfer) => TransferStories[transfer.kind](lakeName(transfer.from_lake_id), lakeName(transfer.to_lake_id));
</script>

{#if transfers.length === 0}
	<p class="text-sm text-mist-400">Never changed hands.</p>
{:else}
	<ul class="divide-y divide-carbon-700/60">
		{#each transfers as transfer (transfer.id)}
			<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm">
				<span class="font-semibold text-volt-300">{formatMoney(transfer.price)}</span>
				<span class="text-mist-100">{story(transfer)}</span>
				{#if Number(transfer.commission) > 0}<span class="text-mist-400">· {formatMoney(transfer.commission)} commission</span>{/if}
				<span class="ml-auto text-xs text-mist-400">{formatWhen(transfer.departed_at)}</span>
			</li>
		{/each}
	</ul>
{/if}
