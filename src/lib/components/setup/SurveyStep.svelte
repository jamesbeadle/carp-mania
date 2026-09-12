<script lang="ts">
	import LakeCanvas from '$lib/components/LakeCanvas.svelte';
	import { WizardStep } from '$lib/contracts/SetupProgress';
	import { SuggestedFirstWorks } from '$lib/domain/sites/siteGuide';
	import { formatWeight } from '$lib/format/weight';
	import type { MyFishery } from '$lib/server/queries/GetMyFishery';

	let { fishery }: { fishery: MyFishery } = $props();

	const GroundworksEditor = '/lake/works';
	const catalogued = $derived(fishery.carp.filter((fish) => fish.is_catalogued));
	const heaviestLb = $derived(catalogued.length > 0 ? Math.max(...catalogued.map((fish) => Number(fish.weight_lb))) : 0);
	const suggestions = $derived(SuggestedFirstWorks[fishery.lake.site_type]);
</script>

<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
	<LakeCanvas lake={fishery.lake} swims={fishery.swims} carp={fishery.carp} />
	<section class="panel">
		<p class="stat-label">The survey</p>
		<h2 class="mb-3 text-2xl text-volt-300">{fishery.lake.name}</h2>
		<dl class="grid grid-cols-2 gap-3 text-sm">
			<div><dt class="stat-label">Water</dt><dd class="text-xl">{Number(fishery.lake.acres)} acres</dd></div>
			<div><dt class="stat-label">Swims</dt><dd class="text-xl">{fishery.swims.length}</dd></div>
			<div><dt class="stat-label">Known fish</dt><dd class="text-xl">{catalogued.length}</dd></div>
			<div><dt class="stat-label">Biggest known</dt><dd class="text-xl">{heaviestLb > 0 ? formatWeight(heaviestLb) : '—'}</dd></div>
		</dl>
		{#if suggestions.length > 0}
			<h3 class="mt-5 mb-2 text-lg text-mist-100">Suggested first works</h3>
			<ul class="list-disc space-y-1 pl-5 text-sm text-mist-200">
				{#each suggestions as suggestion (suggestion)}
					<li>{suggestion}</li>
				{/each}
			</ul>
		{/if}
		<p class="mt-4 text-xs text-mist-400">Works cost money up front and take fishery days. You can skip this and come back to the editor from My fishery any time.</p>
		<footer class="mt-5 flex flex-wrap items-center gap-3">
			<a href={GroundworksEditor} class="button-secondary">Go to the groundworks editor</a>
			<a href="?step={WizardStep.Stock}" class="button-primary ml-auto">Stock it →</a>
		</footer>
	</section>
</div>
