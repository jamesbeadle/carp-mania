<script lang="ts">
	import type { AwardWon } from '$lib/contracts/Awards';
	import { AwardKeys } from '$lib/domain/trophies/awards';
	import AwardCard from './AwardCard.svelte';

	let { awards, isMine = false }: { awards: AwardWon[]; isMine?: boolean } = $props();

	const wonAt = $derived(new Map(awards.map((award) => [award.key, award.wonAt])));
	const shown = $derived(AwardKeys.filter((key) => wonAt.has(key)));
</script>

<section class="panel">
	<div class="mb-3 flex items-end gap-3">
		<div>
			<h2 class="text-xl text-volt-300">Awards</h2>
			<p class="text-xs text-mist-400">{awards.length} of {AwardKeys.length} won.</p>
		</div>
		{#if isMine}<a href="/angler/awards" class="ml-auto text-sm text-surge-400 hover:underline">All awards and the next one →</a>{/if}
	</div>
	{#if shown.length === 0}
		<p class="text-sm text-mist-400">Nothing yet — the first double is the first award.</p>
	{:else}
		<ul class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
			{#each shown as key (key)}
				<AwardCard {key} wonAt={wonAt.get(key) ?? null} isCompact />
			{/each}
		</ul>
	{/if}
</section>
