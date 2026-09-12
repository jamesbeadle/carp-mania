<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import EstateSwitcher from '$lib/components/estate/EstateSwitcher.svelte';
	import LakeCanvas from '$lib/components/LakeCanvas.svelte';
	import WhileYouWereAway from '$lib/components/home/WhileYouWereAway.svelte';
	import BailiffPanel from '$lib/components/lake/BailiffPanel.svelte';
	import FeedPanel from '$lib/components/lake/FeedPanel.svelte';
	import LakeOverview from '$lib/components/lake/LakeOverview.svelte';
	import LedgerPanel from '$lib/components/lake/LedgerPanel.svelte';
	import PredatorPanel from '$lib/components/lake/PredatorPanel.svelte';
	import StockPanel from '$lib/components/lake/StockPanel.svelte';
	import WorksLedgerPanel from '$lib/components/lake/WorksLedgerPanel.svelte';
	import MarketPanel from '$lib/components/market/MarketPanel.svelte';
	import { PikeRules } from '$lib/domain/economy';
	import { inProgressShapesFor } from '$lib/game/builder/draftShapes';
	import { onMount } from 'svelte';

	let { data, form } = $props();

	const tabs = ['Stock', 'Feed', 'Predators', 'Water', 'Groundworks', 'Market', 'Ledger'] as const;
	const MarketAnchor = '#market';
	let activeTab = $state<(typeof tabs)[number]>('Stock');
	const sickCarpCount = $derived(data.fishery.carp.filter((fish) => Number(fish.condition) < PikeRules.SickCarpConditionBelow).length);
	const worksUnderway = $derived(inProgressShapesFor(data.groundworks.inProgress, data.fishery.lake));

	onMount(() => {
		if (location.hash === MarketAnchor) activeTab = 'Market';
	});
</script>

<div class="mb-4"><EstateSwitcher waters={data.waters} currentId={data.fishery.lake.id} returnTo="/lake" /></div>
<WhileYouWereAway summary={data.whileAway} />
<ActionMessage {form} />

<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
	<LakeCanvas lake={data.fishery.lake} swims={data.fishery.swims} carp={data.fishery.carp} drafts={worksUnderway} />
	<LakeOverview lake={data.fishery.lake} profile={data.profile} />
</div>

<nav class="mt-8 mb-4 flex flex-wrap gap-2">
	{#each tabs as tab (tab)}
		<button class="rounded-full px-4 py-1.5 text-sm font-medium transition" class:bg-volt-500={activeTab === tab} class:text-carbon-950={activeTab === tab} class:bg-carbon-800={activeTab !== tab} onclick={() => (activeTab = tab)}>{tab}</button>
	{/each}
</nav>

{#if activeTab === 'Stock'}<StockPanel carp={data.fishery.carp} lake={data.fishery.lake} farmStock={data.farmStock} />{/if}
{#if activeTab === 'Feed'}<FeedPanel lake={data.fishery.lake} carpCount={data.fishery.carp.length} />{/if}
{#if activeTab === 'Predators'}<PredatorPanel lake={data.fishery.lake} {sickCarpCount} />{/if}
{#if activeTab === 'Water'}<BailiffPanel lake={data.fishery.lake} />{/if}
{#if activeTab === 'Groundworks'}
	<p class="mb-4 text-sm text-mist-400">
		Islands, bars, holes, shelves, reeds, swims and the shoreline are all shaped in the editor.
		<a href="/lake/works" class="button-primary ml-3 inline-block px-4 py-1.5 text-base">Open the groundworks editor</a>
	</p>
	<WorksLedgerPanel inProgress={data.groundworks.inProgress} ledger={data.groundworks.ledger} />
{/if}
{#if activeTab === 'Market'}<MarketPanel activity={data.marketActivity} carp={data.fishery.carp} loadedAt={data.loadedAt} />{/if}
{#if activeTab === 'Ledger'}<LedgerPanel visits={data.fishery.visits} catches={data.fishery.catches} carp={data.fishery.carp} />{/if}
