<script lang="ts">
	import type { RodSet } from '$lib/domain/tackle/rodSets';
	import type { RodSetup } from '$lib/domain/tackle/rodSetup';
	import RodSetLines from './RodSetLines.svelte';

	let { savedRods, rodSets }: { savedRods: RodSetup[]; rodSets: RodSet[] } = $props();
</script>

<section class="panel space-y-4">
	<div>
		<h2 class="text-xl text-volt-300">Your set-ups</h2>
		<p class="mt-1 text-sm text-mist-400">Sets you named when tackling up, and the rods as you left them last time. Pick any of them when you next tackle up.</p>
	</div>
	{#each rodSets as set (set.id)}
		<RodSetLines title={set.name} rods={set.rods} />
	{/each}
	{#if savedRods.length > 0}
		<RodSetLines title="As you left them" rods={savedRods} />
	{:else if rodSets.length === 0}
		<p class="text-sm text-mist-400">None yet — tackle up on a water and they are remembered.</p>
	{/if}
</section>
