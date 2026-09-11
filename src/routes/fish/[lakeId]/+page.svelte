<script lang="ts">
	import FishingGame from '$lib/components/game/FishingGame.svelte';
	import { isFishable } from '$lib/domain/simulation/lapseTransfers';
	import { formatMoney } from '$lib/format/money';

	let { data } = $props();

	const isOwnWater = $derived(data.water.lake.owner_id === data.profile.id);
	const carpInTheLake = $derived(data.water.carp.filter(isFishable));
	const knownCarpCount = $derived(carpInTheLake.filter((fish) => fish.is_catalogued).length);
</script>

<h1 class="mb-1 text-4xl text-volt-300">{data.water.lake.name}</h1>
<p class="mb-6 text-sm text-mist-400">{data.water.ownerName}'s water · reputation {Math.round(Number(data.water.lake.reputation))} · {knownCarpCount} carp</p>

{#if data.visitId}
	<FishingGame lake={data.water.lake} swims={data.water.swims} carp={carpInTheLake} profile={data.profile} visitId={data.visitId} />
{:else}
	<section class="panel max-w-xl">
		<h2 class="mb-2 text-2xl text-volt-300">Day ticket</h2>
		<p class="mb-4 text-mist-200">
			{#if isOwnWater}It's your own water — no ticket needed.{:else}A day here costs {formatMoney(data.water.lake.day_ticket_fee)}. You have {formatMoney(data.profile.money)}.{/if}
		</p>
		<form method="POST" action="?/buyTicket">
			<button class="button-primary px-8 py-3 text-lg">{isOwnWater ? 'Walk to the lake' : 'Buy a day ticket'}</button>
		</form>
	</section>
{/if}
