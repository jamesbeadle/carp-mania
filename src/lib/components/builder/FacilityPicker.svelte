<script lang="ts">
	import { FacilityCatalogue, whyFacilityCannotBeBuilt } from '$lib/domain/groundworks/facilities';
	import { Facilities, type Facility } from '$lib/domain/layout/layoutTypes';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { formatMoney } from '$lib/format/money';

	let { builder, built }: { builder: BuilderState; built: Facility[] } = $props();

	const refusalFor = (facility: Facility) => whyFacilityCannotBeBuilt(built, facility);
</script>

<ul class="space-y-2">
	{#each Facilities as facility (facility)}
		{@const profile = FacilityCatalogue[facility]}
		{@const isChosen = builder.draft?.kind === facility}
		{@const refusal = refusalFor(facility)}
		<li>
			<button class="w-full rounded-lg border px-3 py-2 text-left transition" class:border-volt-500={isChosen} class:border-carbon-600={!isChosen} class:bg-carbon-900={!isChosen} disabled={refusal !== null} title={refusal ?? profile.label} onclick={() => builder.place({ kind: facility })}>
				<span class="flex items-baseline justify-between gap-2">
					<span class="font-display text-lg font-bold uppercase" class:text-mist-100={refusal === null} class:text-mist-400={refusal !== null}>{profile.label}</span>
					<span class="text-sm text-volt-300">{formatMoney(profile.cost)} · {profile.days} days</span>
				</span>
				<span class="block text-xs text-mist-400">{refusal ?? profile.blurb}</span>
			</button>
		</li>
	{/each}
</ul>
