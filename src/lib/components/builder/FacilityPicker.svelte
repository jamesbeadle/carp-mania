<script lang="ts">
	import { FacilityCatalogue, type FacilityProfile, upgradeOf, whyFacilityCannotBeBuilt } from '$lib/domain/groundworks/facilities';
	import { isFacilityDraft } from '$lib/domain/groundworks/workKinds';
	import { Facilities, type Facility } from '$lib/domain/layout/layoutTypes';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { startPlacing } from '$lib/game/builder/placement/placementDrafts';
	import type { ToolContext } from '$lib/game/builder/tools/toolHandlers';
	import { formatMoney } from '$lib/format/money';

	let { builder, context }: { builder: BuilderState; context: ToolContext } = $props();

	const layout = $derived(context.layout);
	const built = $derived(layout.facilities);
	const draft = $derived(builder.draft);

	const refusalFor = (facility: Facility) => whyFacilityCannotBeBuilt(built, facility);
	const offered = $derived(Facilities.filter((facility) => upgradeOf(built, facility) === null));
	const isUpgrade = (profile: FacilityProfile) => profile.replaces !== null && built.includes(profile.replaces);
	const chosen = $derived(draft && isFacilityDraft(draft) ? draft.kind : null);
	const shown = $derived(chosen ? [chosen] : offered);
</script>

<ul class="space-y-2">
	{#each shown as facility (facility)}
		{@const profile = FacilityCatalogue[facility]}
		{@const isChosen = draft?.kind === facility}
		{@const refusal = refusalFor(facility)}
		<li>
			<button class="w-full rounded-lg border px-3 py-2 text-left transition" class:border-volt-500={isChosen} class:border-carbon-600={!isChosen} class:bg-carbon-900={!isChosen} disabled={refusal !== null} title={refusal ?? profile.label} onclick={() => startPlacing(builder, facility, context)}>
				<span class="flex items-baseline justify-between gap-2">
					<span class="font-display text-lg font-bold uppercase" class:text-mist-100={refusal === null} class:text-mist-400={refusal !== null}>{#if isUpgrade(profile)}<span class="text-volt-400">Upgrade ·</span> {/if}{profile.label}</span>
					<span class="text-sm text-volt-300">{formatMoney(profile.cost)} · {profile.days} days</span>
				</span>
				<span class="block text-xs text-mist-400">{refusal ?? profile.blurb}</span>
			</button>
		</li>
	{/each}
</ul>
{#if chosen}<button class="mt-2 text-sm text-volt-300 underline" onclick={() => builder.clear()}>Choose something else</button>{/if}
