<script lang="ts">
	import type { GroundworksQuote } from '$lib/contracts/GroundworksQuote';
	import { GroundworksCatalogue } from '$lib/domain/groundworks/catalogue';
	import type { Lake, Profile, Swim } from '$lib/domain/types';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { ToolCatalogue } from '$lib/game/builder/toolCatalogue';
	import { pointerWords } from '$lib/game/stage/pointerWords';
	import DraftControls from './DraftControls.svelte';
	import FacilityPicker from './FacilityPicker.svelte';
	import LandPanel from './LandPanel.svelte';
	import PlacementControls from './PlacementControls.svelte';
	import SitePanel from './SitePanel.svelte';
	import QuotePanel from './QuotePanel.svelte';

	interface Props {
		builder: BuilderState;
		quote: GroundworksQuote | null;
		lake: Lake;
		swims: Swim[];
		profile: Profile;
		hasEarthworksInProgress: boolean;
	}

	let { builder, quote, lake, swims, profile, hasEarthworksInProgress }: Props = $props();

	const context = $derived({ layout: lake.layout, plotAcres: Number(lake.plot_acres), swims });

	const tool = $derived(ToolCatalogue[builder.tool]);
	const blurb = $derived(tool.kind ? GroundworksCatalogue[tool.kind].blurb : null);
</script>

<aside class="panel space-y-4 self-start">
	<div>
		<h3 class="text-xl text-volt-300">{tool.label}</h3>
		{#if blurb}<p class="mt-1 text-sm text-mist-200">{blurb}</p>{/if}
		<p class="mt-1 text-xs text-mist-400">{pointerWords(tool.hint)}</p>
	</div>
	{#if builder.notice}
		<p class="rounded-lg border border-volt-500/40 bg-volt-500/10 px-3 py-2 text-sm text-volt-300">{builder.notice}</p>
	{/if}
	{#if builder.tool === 'facility'}<FacilityPicker {builder} {context} />{/if}
	{#if builder.selectedFacility && !builder.draft}<SitePanel {builder} facility={builder.selectedFacility} {context} />{/if}
	{#if builder.tool === 'land'}<LandPanel {lake} {hasEarthworksInProgress} />{/if}
	{#if builder.draft}<DraftControls {builder} /><PlacementControls {builder} layout={lake.layout} />{/if}
	{#if builder.draft && quote}<QuotePanel {builder} {quote} money={Number(profile.money)} />{/if}
</aside>
