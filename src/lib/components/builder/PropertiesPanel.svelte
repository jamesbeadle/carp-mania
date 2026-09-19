<script lang="ts">
	import type { GroundworksQuote } from '$lib/contracts/GroundworksQuote';
	import { GroundworksCatalogue } from '$lib/domain/groundworks/catalogue';
	import type { Lake, Profile } from '$lib/domain/types';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { ToolCatalogue } from '$lib/game/builder/toolCatalogue';
	import { pointerWords } from '$lib/game/stage/pointerWords';
	import DraftControls from './DraftControls.svelte';
	import FacilityPicker from './FacilityPicker.svelte';
	import LandPanel from './LandPanel.svelte';
	import QuotePanel from './QuotePanel.svelte';

	interface Props {
		builder: BuilderState;
		quote: GroundworksQuote | null;
		lake: Lake;
		profile: Profile;
		hasEarthworksInProgress: boolean;
	}

	let { builder, quote, lake, profile, hasEarthworksInProgress }: Props = $props();

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
	{#if builder.tool === 'facility'}<FacilityPicker {builder} built={lake.layout.facilities} />{/if}
	{#if builder.tool === 'land'}<LandPanel {lake} {hasEarthworksInProgress} />{/if}
	{#if builder.draft}<DraftControls {builder} />{/if}
	{#if builder.draft && quote}<QuotePanel {builder} {quote} money={Number(profile.money)} />{/if}
</aside>
