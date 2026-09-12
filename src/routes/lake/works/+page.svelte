<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import BuilderCanvas from '$lib/components/builder/BuilderCanvas.svelte';
	import LayerToggles from '$lib/components/builder/LayerToggles.svelte';
	import PropertiesPanel from '$lib/components/builder/PropertiesPanel.svelte';
	import ToolRail from '$lib/components/builder/ToolRail.svelte';
	import WorksLedgerPanel from '$lib/components/lake/WorksLedgerPanel.svelte';
	import { GetGroundworksQuote } from '$lib/domain/groundworks/quote';
	import { isEarthwork, isWorkKind } from '$lib/domain/groundworks/workKinds';
	import { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { draftShapesFor } from '$lib/game/builder/draftShapes';
	import { everyLayerShown, lakeWithLayersHidden } from '$lib/game/builder/layerVisibility';
	import { formatMoney } from '$lib/format/money';

	let { data, form } = $props();

	const builder = new BuilderState();
	let layers = $state(everyLayerShown());

	const lake = $derived(data.fishery.lake);
	const inProgress = $derived(data.groundworks.inProgress);
	const hasEarthworksInProgress = $derived(inProgress.some((work) => isWorkKind(work.kind) && isEarthwork(work.kind)));
	const quote = $derived(builder.draft ? GetGroundworksQuote(builder.draft, lake, data.fishery.swims, inProgress) : null);
	const drafts = $derived(draftShapesFor(builder, quote?.failures ?? [], lake, data.fishery.swims, inProgress));
	const sceneLake = $derived(lakeWithLayersHidden(lake, layers));
	const sceneSwims = $derived(layers.swims ? data.fishery.swims : []);
</script>

<div class="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
	<h1 class="text-4xl text-volt-300">Groundworks</h1>
	<a href="/lake" class="text-sm text-surge-400 hover:underline">← Back to my fishery</a>
	<span class="ml-auto text-sm text-mist-400">In the bank <span class="text-volt-300">{formatMoney(data.profile.money)}</span></span>
</div>
<ActionMessage {form} />

<div class="grid gap-4 lg:grid-cols-[auto_1fr_20rem]">
	<ToolRail {builder} />
	<div>
		<BuilderCanvas {builder} {lake} {sceneLake} swims={data.fishery.swims} {sceneSwims} carp={data.fishery.carp} {drafts} />
		<LayerToggles bind:layers />
		<p class="mt-1 text-sm text-mist-400">
			Water {Number(lake.acres)} acres · Plot {Number(lake.plot_acres)} acres · {inProgress.length} {inProgress.length === 1 ? 'work' : 'works'} in progress
		</p>
	</div>
	<PropertiesPanel {builder} {quote} {lake} swims={data.fishery.swims} profile={data.profile} {hasEarthworksInProgress} />
</div>

<div class="mt-8">
	<WorksLedgerPanel {inProgress} ledger={data.groundworks.ledger} />
</div>
