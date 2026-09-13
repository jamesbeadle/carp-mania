<script lang="ts">
	import type { CarpDossier } from '$lib/contracts/CarpDossier';
	import CatchHistory from './CatchHistory.svelte';
	import GrowthChart from './GrowthChart.svelte';
	import SaleHistory from './SaleHistory.svelte';

	let { dossier }: { dossier: CarpDossier } = $props();
</script>

<section class="panel">
	<h2 class="mb-2 text-xl text-volt-300">Growth</h2>
	<GrowthChart points={dossier.growth} />
	<h2 class="mt-6 mb-2 text-xl text-volt-300">Catches ({dossier.carp.times_caught})</h2>
	<CatchHistory catches={dossier.catches} />
	<h2 class="mt-6 mb-2 text-xl text-volt-300">Sales ({dossier.transfers.length})</h2>
	<SaleHistory transfers={dossier.transfers} lakeNames={dossier.lakeNames} />
</section>
