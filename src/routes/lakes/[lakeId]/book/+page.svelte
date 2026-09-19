<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import BookingDiary from '$lib/components/lakes/BookingDiary.svelte';
	import SyndicateCard from '$lib/components/lakes/SyndicateCard.svelte';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import { formatMoney } from '$lib/format/money';

	let { data, form } = $props();

	const lake = $derived(data.lake);
</script>

<svelte:head><title>Book a peg at {lake.name} · Carp Mania</title></svelte:head>

<PlaceBanner kind="office" title="The booking diary at {lake.name}" blurb="Pick a day and a peg; the ticket is paid now and the peg is held for you. A no-show forfeits it at the end of the day. You have {formatMoney(data.profile.money)}.">
	{#snippet actions()}
		<a href="/lakes/{lake.id}" class="button-secondary text-base">Back to the water</a>
	{/snippet}
</PlaceBanner>
<ActionMessage {form} />

<div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
	<BookingDiary {lake} diary={data.diary} />
	<SyndicateCard {lake} isMember={data.diary.isMember} />
</div>
