<script lang="ts">
	import { MultiDay, TicketKindCatalogue, TicketKinds, TicketPrice, type TicketProduct } from '$lib/domain/fishing/ticketBook';

	let { dayTicketFee }: { dayTicketFee: number } = $props();

	let kind = $state<TicketProduct['kind']>('day');
	const isMultiDay = $derived(kind === 'multi_day');
</script>

<form method="POST" action="?/addTicket" class="flex flex-wrap items-end gap-2">
	<label class="flex flex-col gap-1 text-xs text-mist-400">
		<span>Ticket</span>
		<select name="kind" bind:value={kind} class="field">
			{#each TicketKinds as candidate (candidate)}<option value={candidate}>{TicketKindCatalogue[candidate].label}</option>{/each}
		</select>
	</label>
	{#if isMultiDay}
		<label class="flex flex-col gap-1 text-xs text-mist-400">
			<span>Days</span>
			<input name="days" type="number" min={MultiDay.FewestDays} max={MultiDay.MostDays} value={MultiDay.FewestDays} class="field w-20" />
		</label>
	{/if}
	<label class="flex flex-col gap-1 text-xs text-mist-400">
		<span>{isMultiDay ? 'Price a day (£)' : 'Price (£)'}</span>
		<input name="price" type="number" min={TicketPrice.Lowest} max={TicketPrice.Highest} step="1" value={dayTicketFee} class="field w-28" />
	</label>
	<button class="button-primary">Add to the book</button>
</form>
