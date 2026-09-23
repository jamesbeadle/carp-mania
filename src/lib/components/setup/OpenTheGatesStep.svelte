<script lang="ts">
	import { WizardStep } from '$lib/contracts/SetupProgress';
	import { willingnessToPayFor } from '$lib/domain/simulation/visitingAnglers';
	import type { Lake } from '$lib/domain/types';
	import { isStockedToOpen, restockingWords, stockToOpenWords } from '$lib/domain/stock/stockedToOpen';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';
	import AboutToggle from '../stats/AboutToggle.svelte';
	import StatRow from '../stats/StatRow.svelte';

	let { lake, fishCount }: { lake: Lake; fishCount: number } = $props();

	const DayTicket = { MinimumFee: 0, MaximumFee: 250 } as const;
	let typedFee = $state<number | null>(null);
	const fee = $derived(typedFee ?? Number(lake.day_ticket_fee));
	const willingness = $derived(willingnessToPayFor(Number(lake.reputation), lake.region));
	const isPricey = $derived(fee > willingness);
	const isStocked = $derived(isStockedToOpen(fishCount));
	const stats = $derived([
		{ label: 'Reputation', value: String(Math.round(Number(lake.reputation))), tone: 'volt' as const },
		{ label: 'Fish', value: String(fishCount), caption: stockToOpenWords(fishCount), tone: isStocked ? ('mist' as const) : ('danger' as const) },
		{ label: 'They pay up to', value: formatMoney(willingness), caption: `in ${RegionCatalogue[lake.region].label}`, tone: isPricey ? ('danger' as const) : ('mist' as const) }
	]);
</script>

<section class="panel mx-auto max-w-2xl">
	<p class="stat-label">The last step</p>
	<h2 class="mb-4 text-2xl text-volt-300">Open the gates</h2>
	<StatRow {stats} />
	<form method="POST" action="?/open" class="mt-5">
		<label class="block">
			<span class="stat-label">Day ticket fee (£)</span>
			<input name="fee" type="number" min={DayTicket.MinimumFee} max={DayTicket.MaximumFee} step="1" value={fee} oninput={(event) => (typedFee = Number(event.currentTarget.value))} class="field mt-1 text-2xl" />
		</label>
		{#if isPricey}<p class="mt-2 text-sm text-danger-400">Price above what they pay and fewer turn up.</p>{/if}
		{#if !isStocked}<p class="mt-2 text-sm text-danger-400">{restockingWords(fishCount)}. <a href="/market/farms" class="underline">Buy from the farms</a>.</p>{/if}
		<footer class="mt-6 flex items-center gap-3">
			<a href="?step={WizardStep.Stock}" class="button-secondary">← Back</a>
			<button class="button-primary ml-auto" disabled={!isStocked}>Open the gates</button>
		</footer>
	</form>
	<div class="mt-4">
		<AboutToggle title="About opening">Until the gates open {lake.name} is private: no anglers, no takings, no catches, nothing on the globe. A water opens with at least a hundred fish in it, shoal fish included, and closes for restocking if it ever falls below. Go public when you are ready and not before.</AboutToggle>
	</div>
</section>
