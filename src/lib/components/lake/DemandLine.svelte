<script lang="ts">
	import { demandBandOf, demandRatioFor, DemandWords } from '$lib/domain/water/demand';

	let { anglersWanting, swimCount }: { anglersWanting: number; swimCount: number } = $props();

	const ratio = $derived(demandRatioFor(anglersWanting, swimCount));
	const band = $derived(demandBandOf(ratio));
	const words = $derived(DemandWords[band]);
</script>

<p class="mb-3 text-sm text-mist-200">
	Demand {ratio.toFixed(2)} — the water is <span class="text-volt-300">{words.state}</span>. {words.advice}
</p>
