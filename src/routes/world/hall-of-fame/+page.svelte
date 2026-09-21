<script lang="ts">
	import BiggestEverBoard from '$lib/components/hall/BiggestEverBoard.svelte';
	import HonourRoll from '$lib/components/hall/HonourRoll.svelte';
	import LegendsBoard from '$lib/components/hall/LegendsBoard.svelte';
	import PrototypesBoard from '$lib/components/hall/PrototypesBoard.svelte';
	import ScopeTabs from '$lib/components/hall/ScopeTabs.svelte';
	import Skeleton from '$lib/components/loading/Skeleton.svelte';
	import { HallBoard } from '$lib/contracts/HallOfFame';
	import { anglerHonours, waterHonours } from '$lib/game/world/honourRolls';

	let { data } = $props();

	const HallPath = '/world/hall-of-fame';
	const BoardRows = HallBoard.Length;
</script>

<svelte:head><title>Hall of fame · Carp Mania</title></svelte:head>

<div class="mb-4 flex flex-wrap items-end gap-4">
	<div>
		<h1 class="text-4xl text-volt-300">Hall of fame</h1>
		<p class="text-mist-400">The greatest fish, the anglers who had them, the waters that grew them, and the legends now gone.</p>
	</div>
	<a href="/world" class="ml-auto text-sm text-surge-400 hover:underline">← The world</a>
</div>

<div class="mb-5"><ScopeTabs scope={data.scope} basePath={HallPath} /></div>

{#await data.hall}
	<div class="grid gap-6 lg:grid-cols-2">
		<div class="lg:col-span-2"><Skeleton title="Biggest fish caught by an angler" rows={BoardRows} /></div>
		<Skeleton title="Legends" rows={BoardRows} />
		<div class="grid gap-6">
			<Skeleton title="Most fish landed" rows={5} />
			<Skeleton title="Waters of legend" rows={5} />
		</div>
	</div>
{:then hall}
	<div class="grid gap-6 lg:grid-cols-2">
		<div class="lg:col-span-2"><BiggestEverBoard catches={hall.biggestEver} viewerId={data.viewerId} standing={hall.standing} visitorsBest={hall.visitorsBest} boardLength={BoardRows} /></div>
		<LegendsBoard legends={hall.legends} />
		<div class="grid gap-6">
			<HonourRoll title="Most fish landed" blurb="Anglers by fish on the bank, for life." honours={anglerHonours(hall.mostFishLanded)} emptyWords="Nobody has wet a line here yet." viewerId={data.viewerId} />
			<HonourRoll title="Waters of legend" blurb="Waters by the best fish an angler ever had there, owner credited." honours={waterHonours(hall.watersOfLegend)} emptyWords="No angler has had a fish worth remembering here yet." />
			<PrototypesBoard prototypes={hall.prototypes} />
		</div>
	</div>
{:catch}
	<p class="text-sm text-danger-400">The hall would not open. Try again in a moment.</p>
{/await}
