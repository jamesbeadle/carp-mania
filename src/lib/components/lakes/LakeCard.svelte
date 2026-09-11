<script lang="ts">
	import type { PublicLakeSummary } from '$lib/contracts/PublicLakeSummary';
	import { formatMoney } from '$lib/format/money';
	import { formatWeight } from '$lib/format/weight';

	let { summary }: { summary: PublicLakeSummary } = $props();
</script>

<article class="panel flex flex-col gap-3">
	<div>
		<p class="stat-label">{summary.ownerName}'s water</p>
		<h2 class="text-2xl text-gold-300">{summary.lake.name}</h2>
	</div>
	<dl class="grid grid-cols-3 gap-2 text-sm">
		<div><dt class="stat-label">Reputation</dt><dd class="text-xl">{Math.round(Number(summary.lake.reputation))}</dd></div>
		<div><dt class="stat-label">Stock</dt><dd class="text-xl">{summary.carpCount}</dd></div>
		<div><dt class="stat-label">Biggest</dt><dd class="text-xl">{formatWeight(summary.heaviestCarpLb)}</dd></div>
	</dl>
	<p class="text-sm text-mist-400">Transparency {Math.round(Number(summary.lake.transparency))}% · {summary.lake.has_bailiff ? 'bailiffed' : 'no bailiff'} · {summary.lake.pike_count} pike</p>
	<div class="mt-auto flex items-center gap-3">
		<span class="text-lg text-gold-300">{formatMoney(summary.lake.day_ticket_fee)}<span class="text-xs text-mist-400"> / day</span></span>
		<a href="/lakes/{summary.lake.id}" class="button-secondary ml-auto">Look around</a>
		<a href="/fish/{summary.lake.id}" class="button-primary">Fish here</a>
	</div>
</article>
