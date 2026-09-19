<script lang="ts">
	import AwardCard from '$lib/components/angler/AwardCard.svelte';
	import NextAward from '$lib/components/angler/NextAward.svelte';
	import { AwardKeys } from '$lib/domain/trophies/awards';

	let { data } = $props();

	const awards = $derived(data.awards);
	const won = $derived(awards.won);
	const wonAt = $derived(new Map(won.map((award) => [award.key, award.wonAt])));
</script>

<svelte:head><title>Awards · Carp Mania</title></svelte:head>

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<h1 class="text-4xl text-volt-300">Awards</h1>
		<p class="text-mist-400">{won.length} of {AwardKeys.length} won. Each is won once and kept for life.</p>
	</div>
	<a href="/angler" class="ml-auto text-sm text-surge-400 hover:underline">← My angler</a>
</div>

<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
	<ul class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
		{#each AwardKeys as key (key)}
			<AwardCard {key} wonAt={wonAt.get(key) ?? null} />
		{/each}
	</ul>
	<NextAward next={awards.next} />
</div>
