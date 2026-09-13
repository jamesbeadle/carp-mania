<script lang="ts">
	import { honourKindsOf, HonourWords } from '$lib/domain/fishing/honours';
	import type { LandedFish } from '$lib/game/session/landFish';
	import { formatWeight } from '$lib/format/weight';
	import GoFishingButton from './GoFishingButton.svelte';

	let { landed, lost, lakeId }: { landed: LandedFish[]; lost: number; lakeId: string } = $props();

	const heaviest = $derived(landed.length > 0 ? Math.max(...landed.map((fish) => Number(fish.carp.weight_lb))) : 0);
	const bestHonourOf = (fish: LandedFish) => honourKindsOf(fish.honours)[0] ?? null;
</script>

<section class="panel space-y-4">
	<p class="stat-label">Dusk</p>
	<h2 class="text-3xl text-volt-300">Rods in — {landed.length} carp landed</h2>
	<p class="text-mist-200">
		{#if landed.length === 0}A blank. It happens to everyone — try a different swim or bait tomorrow.{:else}Best of the day {formatWeight(heaviest)}. {lost} lost.{/if}
	</p>
	<ul class="grid gap-2 text-sm sm:grid-cols-2">
		{#each landed as fish, index (index)}
			{@const honour = bestHonourOf(fish)}
			<li class="rounded-lg bg-carbon-900 px-3 py-2">
				<span class="text-volt-300">{formatWeight(fish.carp.weight_lb)}</span> {fish.carp.name} from {fish.swim.name}
				{#if honour}<span class="ml-1 rounded-full bg-volt-500/15 px-2 text-xs text-volt-300">{HonourWords[honour]}</span>{/if}
			</li>
		{/each}
	</ul>
	<div class="flex flex-wrap gap-3">
		<GoFishingButton {lakeId} words="Fish another day here" />
		<a href="/lakes" class="button-secondary">Choose another water</a>
		<a href="/angler" class="button-secondary">My angler</a>
	</div>
</section>
