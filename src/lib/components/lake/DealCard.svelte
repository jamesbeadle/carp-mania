<script lang="ts">
	import { termWords, type LakeSponsorship } from '$lib/domain/sponsorship/lakeSponsorship';
	import { BrandCatalogue } from '$lib/domain/tackle/brands';
	import { formatMoney } from '$lib/format/money';
	import { timeLeft } from '$lib/format/timeLeft';
	import StatRow from '../stats/StatRow.svelte';

	let { deal, now }: { deal: LakeSponsorship; now: Date } = $props();

	const stats = $derived([
		{ label: 'On the boards', value: BrandCatalogue[deal.brand].label, tone: 'volt' as const },
		{ label: 'Paid', value: formatMoney(deal.amount), caption: `for ${termWords(deal.termMonths)}` },
		{ label: 'Runs for', value: timeLeft(deal.runsUntil, now), caption: 'real time' }
	]);
</script>

<div class="rounded-xl border border-volt-500/40 bg-carbon-950/60 p-4">
	<StatRow {stats} />
	<p class="mt-2 text-xs text-mist-400">Renewal offers start arriving in the last month of the deal; a new deal signed then runs on from the end of this one.</p>
</div>
