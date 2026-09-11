<script lang="ts">
	import { StartingFloat } from '$lib/domain/economy';
	import { formatMoney } from '$lib/format/money';

	let { moneyLeft }: { moneyLeft: number } = $props();

	const shareLeft = $derived(Math.min(1, Math.max(0, moneyLeft / StartingFloat.Money)));
	const isRunningLow = $derived(shareLeft < 0.15);
</script>

<div>
	<div class="mb-1 flex items-baseline justify-between">
		<span class="stat-label">Budget</span>
		<span class="font-display text-2xl font-bold italic" class:text-volt-300={!isRunningLow} class:text-danger-400={isRunningLow}>{formatMoney(moneyLeft)} left</span>
	</div>
	<div class="h-3 w-full overflow-hidden rounded-full bg-carbon-950">
		<div class="h-full rounded-full bg-gradient-to-r from-volt-500 to-surge-500 transition-all" style="width: {shareLeft * 100}%"></div>
	</div>
	<p class="mt-1 text-right text-xs text-mist-400">of {formatMoney(StartingFloat.Money)} to find, shape and stock a water</p>
</div>
