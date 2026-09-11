<script lang="ts">
	import FisherySummaryCard from '$lib/components/home/FisherySummaryCard.svelte';
	import AnglerSummaryCard from '$lib/components/home/AnglerSummaryCard.svelte';
	import WhileYouWereAway from '$lib/components/home/WhileYouWereAway.svelte';

	let { data } = $props();
</script>

<h1 class="mb-6 text-4xl text-gold-300">Welcome back, {data.profile.display_name}</h1>

<WhileYouWereAway summary={data.whileAway} />

<div class="grid gap-6 md:grid-cols-2">
	<FisherySummaryCard lake={data.fishery.lake} carp={data.fishery.carp} />
	<AnglerSummaryCard profile={data.profile} />
</div>
