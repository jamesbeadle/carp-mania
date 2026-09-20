<script lang="ts">
	import type { BiggestFishInTheGame } from '$lib/contracts/BiggestFish';
	import type { FishermanDiary } from '$lib/contracts/FishermanDiary';
	import type { Lake, Profile } from '$lib/domain/types';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import { conditionsCaption } from '$lib/game/stage/conditionsCaption';
	import EstateSwitcher from '../estate/EstateSwitcher.svelte';
	import BiggestFishLine from '../home/BiggestFishLine.svelte';

	interface Props {
		profile: Profile;
		lake: Lake;
		conditions: StageConditions;
		diary: FishermanDiary;
		waters: Lake[];
		biggestFish: BiggestFishInTheGame | null;
	}

	let { profile, lake, conditions, diary, waters, biggestFish }: Props = $props();

	const greeting = $derived(diary.isSlowingDown ? `${profile.display_name}, ${diary.age} — slowing down now` : `Welcome back, ${profile.display_name} · ${diary.age}`);
	const hasAnEstate = $derived(waters.length > 1);
</script>

<div class="short:gap-0 short:px-2 short:py-2 flex flex-col items-start gap-0.5 px-4 py-3 lg:px-6 lg:pt-5">
	<p class="short:hidden rounded-full bg-carbon-950/45 px-3 py-1 text-xs text-mist-200 backdrop-blur">{greeting}</p>
	<h1 class="short:text-2xl max-w-full truncate text-3xl leading-none text-mist-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-4xl lg:text-6xl">{lake.name}</h1>
	<p class="short:text-xs text-sm text-mist-100/90 capitalize drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">{conditionsCaption(conditions)}</p>
	<div class="short:hidden mt-1"><BiggestFishLine fish={biggestFish} /></div>
	{#if hasAnEstate}
		<div class="mt-1 inline-block rounded-xl bg-carbon-950/45 px-2 py-1 backdrop-blur"><EstateSwitcher {waters} currentId={lake.id} returnTo="/home" isCompact /></div>
	{/if}
</div>
