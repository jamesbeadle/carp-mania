<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import EstateSwitcher from '$lib/components/estate/EstateSwitcher.svelte';
	import LakeCanvas from '$lib/components/LakeCanvas.svelte';
	import WhileYouWereAway from '$lib/components/home/WhileYouWereAway.svelte';
	import BailiffTeamPanel from '$lib/components/lake/BailiffTeamPanel.svelte';
	import FeedPanel from '$lib/components/lake/FeedPanel.svelte';
	import LakeOverview from '$lib/components/lake/LakeOverview.svelte';
	import LedgerPanel from '$lib/components/lake/LedgerPanel.svelte';
	import PredatorPanel from '$lib/components/lake/PredatorPanel.svelte';
	import StockPanel from '$lib/components/lake/StockPanel.svelte';
	import TicketBookPanel from '$lib/components/lake/TicketBookPanel.svelte';
	import BountyPanel from '$lib/components/lake/BountyPanel.svelte';
	import SpeciesPanel from '$lib/components/lake/SpeciesPanel.svelte';
	import WorksLedgerPanel from '$lib/components/lake/WorksLedgerPanel.svelte';
	import GoFishingButton from '$lib/components/game/GoFishingButton.svelte';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import { PikeRules } from '$lib/domain/economy';
	import type { Carp } from '$lib/domain/types';
	import { inProgressShapesFor } from '$lib/game/builder/draftShapes';
	import { bailiffsWord } from '$lib/game/lodge/bailiffsWord';
	import { stockDrawOf } from '$lib/domain/water/stockDraw';

	let { data, form } = $props();

	const tabs = ['Stock', 'Tickets', 'Feed', 'Predators', 'Water', 'Groundworks', 'Ledger'] as const;
	let activeTab = $state<(typeof tabs)[number]>('Stock');
	const fishery = $derived(data.fishery);
	const { lake, carp, shoals, swims } = $derived(fishery);
	const groundworks = $derived(data.groundworks);
	const isSick = (fish: Carp) => Number(fish.condition) < PikeRules.SickCarpConditionBelow;
	const sickCarpCount = $derived(carp.filter(isSick).length);
	const worksUnderway = $derived(inProgressShapesFor(groundworks.inProgress, lake));
	const stockDraw = $derived(stockDrawOf(carp, shoals));
	const openBounty = $derived(data.bounties.find((bounty) => bounty.status === 'open') ?? null);
	const bountySwimId = $derived(openBounty?.swimId ?? null);
	const word = $derived(bailiffsWord(lake, data.whileAway, new Date(data.loadedAt).getDate()));

</script>

<svelte:head><title>The lodge at {lake.name} · Carp Mania</title></svelte:head>

<PlaceBanner kind="lodge" title={lake.name} blurb="The lodge · {Number(lake.acres)} acres · {word}" skyOver={lake} hasBailiff={lake.has_bailiff}>
	{#snippet aside()}<div class="inline-block rounded-xl bg-carbon-950/45 px-2 py-1 backdrop-blur"><EstateSwitcher waters={data.waters} currentId={lake.id} returnTo="/lake" /></div>{/snippet}
	{#snippet actions()}
		<a href="/lake/works" class="button-secondary text-base">Groundworks</a>
		<a href="/lakes/{lake.id}/host-a-match" class="button-secondary text-base">Host a match</a>
		<GoFishingButton lakeId={lake.id} words="Go fishing" buttonClass="button-primary text-base" />
	{/snippet}
</PlaceBanner>
<WhileYouWereAway summary={data.whileAway} />
<ActionMessage {form} />

<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
	<LakeCanvas {lake} {swims} {carp} {shoals} drafts={worksUnderway} {bountySwimId} />
	<LakeOverview {lake} profile={data.profile} {carp} {shoals} species={data.species} />
</div>

<nav class="mt-8 mb-4 flex flex-wrap gap-2">
	{#each tabs as tab (tab)}
		<button class="rounded-full px-4 py-1.5 text-sm font-medium transition" class:bg-volt-500={activeTab === tab} class:text-carbon-950={activeTab === tab} class:bg-carbon-800={activeTab !== tab} onclick={() => (activeTab = tab)}>{tab}</button>
	{/each}
</nav>

{#if activeTab === 'Stock'}<StockPanel {carp} {shoals} {lake} waters={data.waters} />{/if}
{#if activeTab === 'Stock'}<div class="mt-6"><SpeciesPanel {lake} species={data.species} /></div>{/if}
{#if activeTab === 'Tickets'}<TicketBookPanel {lake} book={data.book} swimCount={swims.length} {stockDraw} />{/if}
{#if activeTab === 'Tickets'}<div class="mt-6"><BountyPanel {carp} bounties={data.bounties} /></div>{/if}
{#if activeTab === 'Feed'}<FeedPanel {lake} carpCount={carp.length} />{/if}
{#if activeTab === 'Predators'}<PredatorPanel {lake} {sickCarpCount} />{/if}
{#if activeTab === 'Water'}<BailiffTeamPanel {lake} bailiffs={data.bailiffs} />{/if}
{#if activeTab === 'Groundworks'}
	<p class="mb-4 text-sm text-mist-400">
		Islands, bars, holes, shelves, reeds, swims and the shoreline are all shaped in the editor.
		<a href="/lake/works" class="button-primary ml-3 inline-block px-4 py-1.5 text-base">Open the groundworks editor</a>
	</p>
	<WorksLedgerPanel inProgress={groundworks.inProgress} ledger={groundworks.ledger} />
{/if}
{#if activeTab === 'Ledger'}<LedgerPanel visits={fishery.visits} catches={fishery.catches} {carp} />{/if}
