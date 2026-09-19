<script lang="ts">
	import { AwardCatalogue } from '$lib/domain/trophies/awards';
	import { awardWordsFor, type AwardProgress } from '$lib/domain/trophies/awardProgress';

	let { progress }: { progress: AwardProgress } = $props();

	const percent = $derived(Math.round(progress.share * 100));
	const words = $derived(AwardCatalogue[progress.key].words);
</script>

<li>
	<div class="flex items-baseline justify-between text-sm">
		<span class="font-medium text-mist-100">{awardWordsFor(progress)}</span>
		<span class="text-xs text-mist-400">{percent}%</span>
	</div>
	<p class="text-xs text-mist-400">{words}</p>
	<div class="mt-1 h-1.5 rounded-full bg-carbon-800"><div class="h-1.5 rounded-full bg-volt-500" style="width: {percent}%"></div></div>
</li>
