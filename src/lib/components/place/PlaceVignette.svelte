<script lang="ts">
	import type { PlaceKind } from '$lib/game/scene/placePalette';
	import JettyVignette from './vignettes/JettyVignette.svelte';
	import LodgeVignette from './vignettes/LodgeVignette.svelte';
	import NoticeboardVignette from './vignettes/NoticeboardVignette.svelte';
	import OfficeVignette from './vignettes/OfficeVignette.svelte';
	import ShopVignette from './vignettes/ShopVignette.svelte';
	import SignpostVignette from './vignettes/SignpostVignette.svelte';
	import YardVignette from './vignettes/YardVignette.svelte';

	interface Props {
		kind: PlaceKind;
		isNight: boolean;
		hasBailiff?: boolean;
		noteCount?: number;
		words?: string;
	}

	let { kind, isNight, hasBailiff = false, noteCount = 3, words = 'A WATER OF YOUR OWN' }: Props = $props();
</script>

{#if kind === 'lodge'}
	<LodgeVignette {isNight} {hasBailiff} />
{:else if kind === 'shop'}
	<ShopVignette {isNight} />
{:else if kind === 'noticeboard'}
	<NoticeboardVignette {noteCount} />
{:else if kind === 'signpost'}
	<SignpostVignette />
{:else if kind === 'yard'}
	<YardVignette />
{:else if kind === 'jetty'}
	<JettyVignette />
{:else}
	<OfficeVignette {words} />
{/if}
