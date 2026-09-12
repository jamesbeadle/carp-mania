<script lang="ts">
	import type { Lake, Profile } from '$lib/domain/types';
	import type { StageConditions } from '$lib/game/sky/stageConditions';
	import { conditionsCaption } from '$lib/game/stage/conditionsCaption';

	let { profile, lake, conditions }: { profile: Profile; lake: Lake; conditions: StageConditions } = $props();
</script>

<div class="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-start gap-0.5 px-4 pt-3 lg:px-6 lg:pt-5">
	<p class="rounded-full bg-carbon-950/45 px-3 py-1 text-xs text-mist-200 backdrop-blur">Welcome back, {profile.display_name}</p>
	<h1 class="drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] text-4xl leading-none text-mist-100 lg:text-6xl">{lake.name}</h1>
	<p class="text-sm text-mist-100/90 capitalize drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">{conditionsCaption(conditions)}</p>
</div>
