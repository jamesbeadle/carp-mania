<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import DayTicketOffice from '$lib/components/game/DayTicketOffice.svelte';
	import FishingGame from '$lib/components/game/FishingGame.svelte';
	import { isFishable } from '$lib/domain/simulation/lapseTransfers';

	let { data, form } = $props();

	const water = $derived(data.water);
	const carpInTheLake = $derived(water.carp.filter(isFishable));
	const knownCarpCount = $derived(carpInTheLake.filter((fish) => fish.is_catalogued).length);
	const matchBoardHref = $derived(data.runningMatch?.isEntered ? `/matches/${data.runningMatch.match.id}` : null);
</script>

<svelte:head><title>Fishing {data.water.lake.name} · Carp Mania</title></svelte:head>

{#if data.visit && data.bar}
	<FishingGame lake={water.lake} swims={water.swims} carp={carpInTheLake} shoals={water.shoals} profile={data.profile} visit={data.visit} bar={data.bar} owned={data.owned} {matchBoardHref} />
{:else}
	<ActionMessage {form} />
	<DayTicketOffice {water} profile={data.profile} book={data.book} runningMatch={data.runningMatch} knownCarpCount={knownCarpCount} />
{/if}
