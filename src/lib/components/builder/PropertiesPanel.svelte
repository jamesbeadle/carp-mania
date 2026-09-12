<script lang="ts">
	import type { GroundworksQuote } from '$lib/contracts/GroundworksQuote';
	import { GroundworksCatalogue } from '$lib/domain/groundworks/catalogue';
	import type { Lake, Profile, Swim } from '$lib/domain/types';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { ToolCatalogue } from '$lib/game/builder/toolCatalogue';
	import DraftControls from './DraftControls.svelte';
	import DrawingControls from './DrawingControls.svelte';
	import FacilityPicker from './FacilityPicker.svelte';
	import LandPanel from './LandPanel.svelte';
	import NewSwimPanel from './NewSwimPanel.svelte';
	import QuotePanel from './QuotePanel.svelte';
	import SelectedSwimPanel from './SelectedSwimPanel.svelte';

	interface Props {
		builder: BuilderState;
		quote: GroundworksQuote | null;
		lake: Lake;
		swims: Swim[];
		profile: Profile;
		hasEarthworksInProgress: boolean;
	}

	let { builder, quote, lake, swims, profile, hasEarthworksInProgress }: Props = $props();

	const tool = $derived(ToolCatalogue[builder.tool]);
	const blurb = $derived(tool.kind ? GroundworksCatalogue[tool.kind].blurb : null);
	const selectedSwim = $derived(swims.find((swim) => swim.id === builder.selectedSwimId) ?? null);
</script>

<aside class="panel space-y-4 self-start">
	<div>
		<h3 class="text-xl text-volt-300">{tool.label}</h3>
		{#if blurb}<p class="mt-1 text-sm text-mist-200">{blurb}</p>{/if}
		<p class="mt-1 text-xs text-mist-400">{tool.hint}</p>
	</div>
	{#if builder.notice}
		<p class="rounded-lg border border-volt-500/40 bg-volt-500/10 px-3 py-2 text-sm text-volt-300">{builder.notice}</p>
	{/if}
	{#if builder.tool === 'facility'}<FacilityPicker {builder} />{/if}
	{#if builder.tool === 'land'}<LandPanel {lake} {hasEarthworksInProgress} />{/if}
	{#if builder.tool === 'swim' && builder.swimPoint}<NewSwimPanel {lake} {swims} point={builder.swimPoint} />{/if}
	{#if builder.tool === 'select' && selectedSwim}<SelectedSwimPanel {lake} {swims} swim={selectedSwim} movePoint={builder.swimPoint} />{/if}
	{#if builder.isDrawing}<DrawingControls {builder} />{/if}
	{#if builder.draft}<DraftControls {builder} />{/if}
	{#if builder.draft && quote}<QuotePanel {builder} {quote} money={Number(profile.money)} />{/if}
</aside>
