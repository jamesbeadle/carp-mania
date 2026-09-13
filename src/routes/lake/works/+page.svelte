<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import Bench from '$lib/components/builder/Bench.svelte';
	import BuilderCanvas from '$lib/components/builder/BuilderCanvas.svelte';
	import LayerToggles from '$lib/components/builder/LayerToggles.svelte';
	import PropertiesPanel from '$lib/components/builder/PropertiesPanel.svelte';
	import ToolRail from '$lib/components/builder/ToolRail.svelte';
	import WorksLedgerPanel from '$lib/components/lake/WorksLedgerPanel.svelte';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import PlaceSheet from '$lib/components/stage/PlaceSheet.svelte';
	import { GetGroundworksQuote } from '$lib/domain/groundworks/quote';
	import { isEarthwork, isWorkKind } from '$lib/domain/groundworks/workKinds';
	import { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { draftShapesFor } from '$lib/game/builder/draftShapes';
	import { everyLayerShown, lakeWithLayersHidden } from '$lib/game/builder/layerVisibility';
	import { wantsTheDetails } from '$lib/game/builder/wantsTheDetails';
	import { ScreenSize } from '$lib/game/stage/screenSize.svelte';
	import { formatMoney } from '$lib/format/money';

	let { data, form } = $props();

	const SheetTitle = 'The plan';
	const builder = new BuilderState();
	const screen = new ScreenSize();
	let layers = $state(everyLayerShown());
	let isSheetOpen = $state(false);
	let wasWantingDetails = false;

	const lake = $derived(data.fishery.lake);
	const inProgress = $derived(data.groundworks.inProgress);
	const hasEarthworksInProgress = $derived(inProgress.some((work) => isWorkKind(work.kind) && isEarthwork(work.kind)));
	const quote = $derived(builder.draft ? GetGroundworksQuote(builder.draft, lake, data.fishery.swims, inProgress) : null);
	const drafts = $derived(draftShapesFor(builder, quote?.failures ?? [], lake, data.fishery.swims, inProgress));
	const sceneLake = $derived(lakeWithLayersHidden(lake, layers));
	const sceneSwims = $derived(layers.swims ? data.fishery.swims : []);
	const worksWord = $derived(`${inProgress.length} ${inProgress.length === 1 ? 'work' : 'works'} in progress`);

	$effect(() => screen.watch());
	$effect(() => {
		const isWanting = wantsTheDetails(builder);
		if (screen.isPhone && isWanting && !wasWantingDetails) isSheetOpen = true;
		wasWantingDetails = isWanting;
	});
</script>

<svelte:head><title>Groundworks at {lake.name} · Carp Mania</title></svelte:head>

<PlaceBanner kind="yard" title="Groundworks" blurb="{lake.name} · {Number(lake.acres)} acres of water on a {Number(lake.plot_acres)}-acre plot · {worksWord}" skyOver={lake}>
	{#snippet actions()}
		<span class="px-2 text-sm text-mist-100">In the bank <span class="text-volt-300">{formatMoney(data.profile.money)}</span></span>
		<a href="/lake" class="button-secondary text-base">← The lodge</a>
	{/snippet}
</PlaceBanner>
<ActionMessage {form} />

<div class="grid gap-4 lg:grid-cols-[auto_1fr_20rem]">
	<ToolRail {builder} />
	<div>
		<BuilderCanvas {builder} {lake} {sceneLake} swims={data.fishery.swims} {sceneSwims} carp={data.fishery.carp} {drafts} />
		<Bench {builder} failures={quote?.failures ?? []} {lake} swims={data.fishery.swims} onDetails={() => (isSheetOpen = true)} />
		<LayerToggles bind:layers />
	</div>
	<div class="hidden lg:block"><PropertiesPanel {builder} {quote} {lake} profile={data.profile} {hasEarthworksInProgress} /></div>
</div>

{#if screen.isPhone}
	<PlaceSheet title={SheetTitle} isOpen={isSheetOpen} onClose={() => (isSheetOpen = false)}>
		<PropertiesPanel {builder} {quote} {lake} profile={data.profile} {hasEarthworksInProgress} />
	</PlaceSheet>
{/if}

<div class="mt-8">
	<WorksLedgerPanel {inProgress} ledger={data.groundworks.ledger} />
</div>
