<script lang="ts">
	import type { FishermanDiary } from '$lib/contracts/FishermanDiary';
	import type { Lake, Profile } from '$lib/domain/types';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import { conditionsCaption } from '$lib/game/stage/conditionsCaption';
	import EstateSwitcher from '../estate/EstateSwitcher.svelte';

	interface Props {
		profile: Profile;
		lake: Lake;
		conditions: StageConditions;
		diary: FishermanDiary;
		waters: Lake[];
	}

	let { profile, lake, conditions, diary, waters }: Props = $props();

	const greeting = $derived(diary.isSlowingDown ? `${profile.display_name}, ${diary.age} — slowing down now` : `Welcome back, ${profile.display_name} · ${diary.age}`);
	const hasAnEstate = $derived(waters.length > 1);
</script>

<div class="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-start gap-0.5 px-4 pt-3 lg:px-6 lg:pt-5">
	<p class="short:hidden rounded-full bg-carbon-950/45 px-3 py-1 text-xs text-mist-200 backdrop-blur">{greeting}</p>
	<h1 class="short:text-3xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] text-4xl leading-none text-mist-100 lg:text-6xl">{lake.name}</h1>
	<p class="text-sm text-mist-100/90 capitalize drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">{conditionsCaption(conditions)}</p>
	{#if hasAnEstate}
		<div class="pointer-events-auto mt-1 inline-block rounded-xl bg-carbon-950/45 px-2 py-1 backdrop-blur"><EstateSwitcher {waters} currentId={lake.id} returnTo="/home" isCompact /></div>
	{/if}
</div>
