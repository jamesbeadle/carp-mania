<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import DayTicketOffice from '$lib/components/game/DayTicketOffice.svelte';
	import FishingGame from '$lib/components/game/FishingGame.svelte';
	import { isFishable } from '$lib/domain/simulation/lapseTransfers';

	let { data, form } = $props();

	const water = $derived(data.water);
	const carpInTheLake = $derived(water.carp.filter(isFishable));
	const knownCarpCount = $derived(carpInTheLake.filter((fish) => fish.is_catalogued).length);
	const waterAsFound = $derived(data.visit?.waterAsFound ?? water);
	const setup = $derived({ ...waterAsFound, carp: waterAsFound.carp.filter(isFishable), profile: data.profile, visit: data.visit, bar: data.bar });
</script>

<svelte:head><title>Fishing {water.lake.name} · Carp Mania</title></svelte:head>

{#if data.visit && data.bar}
	<FishingGame setup={{ ...setup, visit: data.visit, bar: data.bar }} swims={water.swims} owned={data.owned} rodSets={data.rodSets} />
{:else}
	<ActionMessage {form} />
	<DayTicketOffice {water} profile={data.profile} book={data.book} {knownCarpCount} streakIfFishedToday={data.streakIfFishedToday} />
{/if}
