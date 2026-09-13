<script lang="ts">
	import type { WhileYouWereAway } from '$lib/contracts/WhileYouWereAway';
	import { FisheryClock } from '$lib/domain/simulation/elapsedDays';
	import { netMoneyFor } from '$lib/domain/simulation/simulateOneDay';
	import { formatMoney } from '$lib/format/money';

	let { summary }: { summary: WhileYouWereAway } = $props();

	const dayWord = $derived(summary.daysSimulated === 1 ? 'day' : 'days');
	const heatwaveDayWord = $derived(summary.heatwaveDays === 1 ? 'day' : 'days');
	const isCapped = $derived(summary.daysSimulated >= FisheryClock.MaximumDaysSimulatedPerVisit);
	const moneyLines = $derived(
		[
			{ label: 'Day tickets', amount: summary.feesCollected },
			{ label: 'Lodge', amount: summary.lodgeTakings },
			{ label: 'Bailiff', amount: -summary.bailiffWages },
			{ label: 'Aerator', amount: -summary.aeratorRunning }
		].filter((line) => line.amount !== 0)
	);
</script>

{#if summary.daysSimulated > 0}
	<section class="panel mb-6 border-volt-500/40">
		<p class="stat-label">While you were away · {summary.daysSimulated} fishery {dayWord}</p>
		<p class="mt-2 text-mist-100">
			{summary.anglersVisited} anglers fished your water and landed {summary.fishCaught} carp —
			<span class="text-volt-300">{formatMoney(netMoneyFor(summary))}</span> after the bills.
		</p>
		<dl class="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
			{#each moneyLines as line (line.label)}
				<div><dt class="stat-label">{line.label}</dt><dd class:text-volt-300={line.amount > 0} class:text-mist-200={line.amount < 0}>{formatMoney(line.amount)}</dd></div>
			{/each}
		</dl>
		{#each summary.visitorsBigFish as line (line)}
			<p class="mt-2 text-sm text-volt-300">{line}</p>
		{/each}
		{#if summary.worksCompleted.length > 0}
			<p class="mt-2 text-sm text-mist-200">Works finished: {summary.worksCompleted.join(', ')}.</p>
		{/if}
		{#if summary.frySpawned > 0}
			<p class="mt-2 text-sm text-mist-200">The carp spawned in the weed — {summary.frySpawned} fry nobody has seen yet.</p>
		{/if}
		{#if summary.carpArrived.length > 0}
			<p class="mt-2 text-sm text-mist-200">Arrived and in the lake: {summary.carpArrived.join(', ')}.</p>
		{/if}
		{#if summary.heatwaveDays > 0}
			<p class="mt-2 text-sm text-mist-400">{summary.heatwaveDays} heatwave {heatwaveDayWord} — hard on the fish without an aerator.</p>
		{/if}
		{#if summary.carpTakenByPike.length > 0}
			<p class="mt-2 text-sm text-mist-400">The pike took {summary.carpTakenByPike.join(', ')} — sick fish, out of the water.</p>
		{/if}
		{#if summary.carpDiedOfOldAge.length > 0}
			<p class="mt-2 text-sm text-mist-400">{summary.carpDiedOfOldAge.join(', ')} died of old age — in the book now, never to be caught again.</p>
		{/if}
		{#if isCapped}
			<p class="mt-2 text-xs text-mist-400">{FisheryClock.MaximumDaysSimulatedPerVisit} fishery days is as far as the water runs on its own. Any longer and the fish just waited for you.</p>
		{/if}
	</section>
{/if}
