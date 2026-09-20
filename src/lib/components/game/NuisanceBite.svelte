<script lang="ts">
	import type { Carp } from '$lib/domain/types';

	let { nuisance }: { nuisance: Carp[] } = $props();

	const wordsFor = (fish: Carp) => `${fish.name.toLowerCase()} of ${fish.weight_lb} lb`;
	const words = $derived(nuisance.map(wordsFor).join(', '));
</script>

{#if nuisance.length > 0}
	<p class="text-xs text-mist-400">Nuisance bites — {words}.</p>
{/if}
