<script lang="ts">
	import { fameFactor } from '$lib/domain/market/valuation';

	let { fame }: { fame: number } = $props();

	const FameTiers = [
		{ from: 60, label: 'Legend' },
		{ from: 30, label: 'Famous' },
		{ from: 10, label: 'Well known' },
		{ from: 1, label: 'Known' },
		{ from: 0, label: 'Unknown' }
	] as const;

	const tier = $derived(FameTiers.find((candidate) => fame >= candidate.from)?.label ?? 'Unknown');
	const upliftPercent = $derived(Math.round((fameFactor(fame) - 1) * 100));
</script>

<span class="inline-flex items-baseline gap-2 rounded-full border border-volt-500/40 bg-volt-500/10 px-2.5 py-0.5" title="Fame adds {upliftPercent}% to the guide price">
	<span class="font-display text-sm font-bold tracking-wide text-volt-300 uppercase">{tier}</span>
	<span class="text-xs text-mist-200">fame {fame}</span>
</span>
