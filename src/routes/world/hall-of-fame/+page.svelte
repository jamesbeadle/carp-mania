<script lang="ts">
	import BiggestEverBoard from '$lib/components/hall/BiggestEverBoard.svelte';
	import HonourRoll from '$lib/components/hall/HonourRoll.svelte';
	import LegendsBoard from '$lib/components/hall/LegendsBoard.svelte';
	import ScopeTabs from '$lib/components/hall/ScopeTabs.svelte';
	import { anglerHonours, matchHonours, waterHonours } from '$lib/game/world/honourRolls';

	let { data } = $props();

	const HallPath = '/world/hall-of-fame';
</script>

<svelte:head><title>Hall of fame · Carp Mania</title></svelte:head>

<div class="mb-4 flex flex-wrap items-end gap-4">
	<div>
		<h1 class="text-4xl text-volt-300">Hall of fame</h1>
		<p class="text-mist-400">What the game remembers: the greatest fish, the anglers who had them, the waters that grew them, and the legends now gone.</p>
	</div>
	<a href="/world" class="ml-auto text-sm text-surge-400 hover:underline">← The world</a>
</div>

<div class="mb-5"><ScopeTabs scope={data.hall.scope} basePath={HallPath} /></div>

<div class="grid gap-6 lg:grid-cols-2">
	<div class="lg:col-span-2"><BiggestEverBoard catches={data.hall.biggestEver} /></div>
	<LegendsBoard legends={data.hall.legends} />
	<div class="grid gap-6">
		<HonourRoll title="Most fish landed" blurb="Signed-in anglers by fish on the bank, for life." honours={anglerHonours(data.hall.mostFishLanded)} emptyWords="Nobody has wet a line here yet." />
		<HonourRoll title="Waters of legend" blurb="Waters by the best fish they ever produced, owner credited." honours={waterHonours(data.hall.watersOfLegend)} emptyWords="No water has produced a fish worth remembering yet." />
		<HonourRoll title="Match winners" blurb="Anglers by trophies won in matches, across every generation of their line." honours={matchHonours(data.hall.matchWinners)} emptyWords="No match has been fished yet." />
	</div>
</div>
