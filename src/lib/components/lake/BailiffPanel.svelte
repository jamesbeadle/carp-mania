<script lang="ts">
	import { Prices } from '$lib/domain/economy';
	import type { Lake } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import WaterQualityBars from '../WaterQualityBars.svelte';

	let { lake }: { lake: Lake } = $props();
</script>

<section class="panel">
	<h3 class="mb-1 text-xl text-gold-300">Water &amp; bailiff</h3>
	<p class="mb-4 text-sm text-mist-400">
		Silt and weed creep up every day; colour and transparency follow. A bailiff clears weed, keeps silt down, tidies the banks and
		makes sure every angler pays. Wages are {formatMoney(Prices.BailiffDailyWage)} a day.
	</p>
	<WaterQualityBars {lake} />
	<div class="mt-5">
		{#if lake.has_bailiff}
			<form method="POST" action="?/dismissBailiff" class="flex items-center gap-3">
				<span class="text-sm text-reed-300">Bailiff on the bank.</span>
				<button class="button-secondary">Dismiss</button>
			</form>
		{:else}
			<form method="POST" action="?/hireBailiff" class="flex items-center gap-3">
				<span class="text-sm text-danger-400">No bailiff — the water is drifting and some anglers fish for free.</span>
				<button class="button-primary">Hire a bailiff</button>
			</form>
		{/if}
	</div>
</section>
