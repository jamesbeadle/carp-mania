<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import DayTicketOffice from '$lib/components/game/DayTicketOffice.svelte';
	import FishingGame from '$lib/components/game/FishingGame.svelte';
	import { isFishable } from '$lib/domain/simulation/lapseTransfers';

	let { data, form } = $props();

	const carpInTheLake = $derived(data.water.carp.filter(isFishable));
	const matchBoardHref = $derived(data.runningMatch?.isEntered ? `/matches/${data.runningMatch.match.id}` : null);
</script>

<svelte:head><title>Fishing {data.water.lake.name} · Carp Mania</title></svelte:head>

{#if data.visit && data.bar}
	<FishingGame lake={data.water.lake} swims={data.water.swims} carp={carpInTheLake} profile={data.profile} visit={data.visit} bar={data.bar} owned={data.owned} {matchBoardHref} />
{:else}
	<ActionMessage {form} />
	<DayTicketOffice water={data.water} profile={data.profile} book={data.book} runningMatch={data.runningMatch} knownCarpCount={carpInTheLake.filter((fish) => fish.is_catalogued).length} />
{/if}
