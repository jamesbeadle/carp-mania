<script lang="ts">
	import type { WhileYouWereAway } from '$lib/contracts/WhileYouWereAway';
	import { formatMoney } from '$lib/format/money';

	let { summary }: { summary: WhileYouWereAway } = $props();
</script>

{#if summary.daysSimulated > 0}
	<section class="panel mb-6 border-gold-500/40">
		<p class="stat-label">While you were away · {summary.daysSimulated} fishery {summary.daysSimulated === 1 ? 'day' : 'days'}</p>
		<p class="mt-2 text-mist-100">
			{summary.anglersVisited} anglers fished your water and landed {summary.fishCaught} carp. You took
			<span class="text-gold-300">{formatMoney(summary.feesCollected)}</span> in day tickets
			{#if summary.bailiffWages > 0}and paid the bailiff {formatMoney(summary.bailiffWages)}{/if}.
		</p>
		{#if summary.carpTakenByPike.length > 0}
			<p class="mt-2 text-sm text-mist-400">The pike took {summary.carpTakenByPike.join(', ')} — sick fish, out of the water.</p>
		{/if}
	</section>
{/if}
