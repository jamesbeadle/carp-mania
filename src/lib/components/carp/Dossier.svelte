<script lang="ts">
	import type { CarpDossier } from '$lib/contracts/CarpDossier';
	import { StrainCatalogue } from '$lib/domain/strains';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatWeight } from '$lib/format/weight';
	import CarpPortrait from './CarpPortrait.svelte';
	import CatchHistory from './CatchHistory.svelte';
	import DossierFacts from './DossierFacts.svelte';
	import GrowthChart from './GrowthChart.svelte';
	import SaleHistory from './SaleHistory.svelte';
	import TransitBadge from './TransitBadge.svelte';

	let { dossier, hasListingLink = true }: { dossier: CarpDossier; hasListingLink?: boolean } = $props();
</script>

<section class="panel">
	<div class="mb-4 flex flex-wrap items-end gap-3">
		<div>
			<p class="stat-label">{StrainCatalogue[dossier.carp.strain].label} carp</p>
			<h1 class="text-4xl text-volt-300">{dossier.carp.name} · {formatWeight(dossier.carp.weight_lb)}</h1>
		</div>
		<TransitBadge carp={dossier.carp} />
		{#if dossier.openListingId && hasListingLink}
			<a href="/market/{dossier.openListingId}" class="button-primary ml-auto">See listing</a>
		{/if}
	</div>
	<CarpPortrait strain={dossier.carp.strain} weightLb={Number(dossier.carp.weight_lb)} />
	<p class="my-4 text-sm text-mist-200">
		Lake: <a href="/lakes/{dossier.lake.id}" class="text-volt-300 hover:underline">{dossier.lake.name}</a>
		<span class="text-mist-400">({RegionCatalogue[dossier.lake.region].label})</span>
		· Owner: <a href="/anglers/{dossier.lake.ownerId}" class="text-volt-300 hover:underline">{dossier.lake.ownerName}</a>
	</p>
	<DossierFacts {dossier} />
	<h2 class="mt-6 mb-2 text-xl text-volt-300">Growth</h2>
	<GrowthChart points={dossier.growth} />
	<div class="mt-6 grid gap-6 lg:grid-cols-2">
		<div>
			<h2 class="mb-2 text-xl text-volt-300">Catches ({dossier.carp.times_caught})</h2>
			<CatchHistory catches={dossier.catches} />
		</div>
		<div>
			<h2 class="mb-2 text-xl text-volt-300">Sales ({dossier.transfers.length})</h2>
			<SaleHistory transfers={dossier.transfers} lakeNames={dossier.lakeNames} />
		</div>
	</div>
</section>
