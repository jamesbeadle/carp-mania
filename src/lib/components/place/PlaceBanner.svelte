<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { BankPalette } from '$lib/game/scene/palette';
	import type { PlaceKind } from '$lib/game/scene/placePalette';
	import { SomewhereInTheWorld, type SkyOver } from '$lib/game/sky/skyOver';
	import { stageConditionsFor } from '$lib/game/sky/stageConditions';
	import { lakeLightingFor } from '$lib/game/stage/lakeLighting';
	import { StageClock } from '$lib/game/stage/stageClock.svelte';
	import LightingOverlays from '../stage/LightingOverlays.svelte';
	import SkyCanvas from '../stage/SkyCanvas.svelte';
	import PlaceVignette from './PlaceVignette.svelte';

	interface Props {
		kind: PlaceKind;
		title: string;
		blurb?: string;
		skyOver?: SkyOver | null;
		hasBailiff?: boolean;
		noteCount?: number;
		words?: string;
		actions?: Snippet;
		aside?: Snippet;
	}

	let { kind, title, blurb, skyOver = null, hasBailiff = false, noteCount = 3, words, actions, aside }: Props = $props();

	const NightBelowDaylight = 0.5;
	const NightDimming = 0.4;
	const clock = new StageClock();
	const ground = `linear-gradient(180deg, ${BankPalette.GrassFar}, ${BankPalette.GrassNear})`;

	const over = $derived(skyOver ?? (page.data.hud?.skyOver as SkyOver | null | undefined) ?? SomewhereInTheWorld);
	const conditions = $derived(stageConditionsFor(over, clock.now));
	const lighting = $derived(lakeLightingFor(conditions));
	const isNight = $derived(lighting.daylight < NightBelowDaylight);
	const vignetteFilter = $derived(`${lighting.seasonFilter} brightness(${1 - (1 - lighting.daylight) * NightDimming})`);

	$effect(() => clock.start());
</script>

<header class="relative mb-6 overflow-hidden rounded-2xl border border-carbon-600/80 shadow-lg shadow-carbon-950/60">
	<div class="absolute inset-0"><SkyCanvas {conditions} layer="backdrop" /></div>
	<div class="absolute inset-0 bg-carbon-950/30"></div>
	<div class="absolute inset-x-0 bottom-0 h-14 sm:h-16" style="background: {ground}; filter: {lighting.seasonFilter}"><LightingOverlays {lighting} /></div>
	<div class="relative flex flex-wrap items-end gap-x-3 gap-y-3 px-4 pt-5 pb-3 sm:gap-x-5 sm:px-6 sm:pt-6">
		<div class="h-14 w-24 shrink-0 sm:h-24 sm:w-40" style="filter: {vignetteFilter}"><PlaceVignette {kind} {isNight} {hasBailiff} {noteCount} {words} /></div>
		<div class="min-w-48 flex-1 pb-1">
			<h1 class="text-2xl leading-none break-words text-mist-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)] sm:text-5xl">{title}</h1>
			{#if blurb}<p class="mt-1 text-sm text-mist-100/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">{blurb}</p>{/if}
			{#if aside}<div class="mt-2">{@render aside()}</div>{/if}
		</div>
		{#if actions}<div class="ml-auto flex flex-wrap items-center gap-2 rounded-2xl bg-carbon-950/45 p-1.5 backdrop-blur sm:justify-end">{@render actions()}</div>{/if}
	</div>
</header>
