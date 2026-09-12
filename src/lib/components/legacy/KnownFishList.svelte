<script lang="ts">
	import type { KnownFish } from '$lib/contracts/Scrapbook';
	import { formatWeight } from '$lib/format/weight';

	let { fishKnown }: { fishKnown: KnownFish[] } = $props();
</script>

<section class="panel">
	<h2 class="mb-1 text-xl text-volt-300">The fish they knew</h2>
	<p class="mb-3 text-xs text-mist-400">Every carp this fisherman had on the bank, and whether it still swims.</p>
	{#if fishKnown.length === 0}
		<p class="text-sm text-mist-400">Not a fish yet.</p>
	{:else}
		<ul class="divide-y divide-carbon-700/60 text-sm">
			{#each fishKnown as fish (fish.carpId)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
					<a href="/carp/{fish.carpId}" class="text-mist-100 hover:underline">{fish.name}</a>
					<span class="text-mist-400">{fish.timesCaught} {fish.timesCaught === 1 ? 'time' : 'times'} · best {formatWeight(fish.bestLb)}</span>
					<span class="ml-auto text-xs" class:text-volt-300={fish.isStillSwimming} class:text-mist-400={!fish.isStillSwimming}>{fish.isStillSwimming ? 'still swims' : 'in the book'}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
