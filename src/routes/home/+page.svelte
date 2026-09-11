<script lang="ts">
	import AnglerSummaryCard from '$lib/components/home/AnglerSummaryCard.svelte';
	import FisherySummaryCard from '$lib/components/home/FisherySummaryCard.svelte';
	import InboxCard from '$lib/components/home/InboxCard.svelte';
	import WhileYouWereAway from '$lib/components/home/WhileYouWereAway.svelte';
	import WorksInProgressCard from '$lib/components/home/WorksInProgressCard.svelte';

	let { data } = $props();
</script>

<h1 class="mb-6 text-4xl text-volt-300">Welcome back, {data.profile.display_name}</h1>

<WhileYouWereAway summary={data.whileAway} />

<div class="grid gap-6 md:grid-cols-2">
	<FisherySummaryCard lake={data.fishery.lake} carp={data.fishery.carp} />
	<AnglerSummaryCard profile={data.profile} />
	<WorksInProgressCard works={data.works} />
	<InboxCard notifications={data.unreadNotifications} unreadCount={data.unreadCount} />
</div>
