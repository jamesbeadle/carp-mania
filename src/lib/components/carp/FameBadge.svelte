<script lang="ts">
	import { fameFactor } from '$lib/domain/market/valuation';
	import { fameTierOf } from './fameTier';

	let { fame }: { fame: number } = $props();

	const tier = $derived(fameTierOf(fame));
	const upliftPercent = $derived(Math.round((fameFactor(fame) - 1) * 100));
</script>

<span class="inline-flex items-baseline gap-2 rounded-full border border-volt-500/40 bg-volt-500/10 px-2.5 py-0.5" title="Fame adds {upliftPercent}% to the guide price">
	<span class="font-display text-sm font-bold tracking-wide text-volt-300 uppercase">{tier}</span>
	<span class="text-xs text-mist-200">fame {fame}</span>
</span>
