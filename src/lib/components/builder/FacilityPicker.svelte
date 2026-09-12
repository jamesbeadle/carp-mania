<script lang="ts">
	import { GroundworksCatalogue, WorkPrices } from '$lib/domain/groundworks/catalogue';
	import type { WorkDraft } from '$lib/domain/groundworks/workKinds';
	import type { BuilderState } from '$lib/game/builder/builderState.svelte';
	import { formatMoney } from '$lib/format/money';

	let { builder }: { builder: BuilderState } = $props();

	const facilities: { draft: WorkDraft; cost: number; days: number }[] = [
		{ draft: { kind: 'car_park' }, ...WorkPrices.CarPark },
		{ draft: { kind: 'lodge' }, ...WorkPrices.Lodge },
		{ draft: { kind: 'aerator' }, ...WorkPrices.Aerator }
	];
</script>

<ul class="space-y-2">
	{#each facilities as facility (facility.draft.kind)}
		{@const profile = GroundworksCatalogue[facility.draft.kind]}
		{@const isChosen = builder.draft?.kind === facility.draft.kind}
		<li>
			<button class="w-full rounded-lg border px-3 py-2 text-left transition" class:border-volt-500={isChosen} class:border-carbon-600={!isChosen} class:bg-carbon-900={!isChosen} onclick={() => builder.place(facility.draft)}>
				<span class="flex items-baseline justify-between gap-2">
					<span class="font-display text-lg font-bold uppercase text-mist-100">{profile.label}</span>
					<span class="text-sm text-volt-300">{formatMoney(facility.cost)} · {facility.days} days</span>
				</span>
				<span class="block text-xs text-mist-400">{profile.blurb}</span>
			</button>
		</li>
	{/each}
</ul>
