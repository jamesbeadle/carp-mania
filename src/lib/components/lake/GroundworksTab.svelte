<script lang="ts">
	import type { MyGroundworks } from '$lib/contracts/MyGroundworks';
	import WorksLedgerPanel from './WorksLedgerPanel.svelte';
	import WorksStats from './WorksStats.svelte';

	let { groundworks }: { groundworks: MyGroundworks } = $props();
</script>

<section class="panel mb-6">
	<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
		<h3 class="text-xl text-volt-300">Groundworks</h3>
		<a href="/lake/works" class="button-primary text-base">Open the groundworks editor</a>
	</div>
	<WorksStats inProgress={groundworks.inProgress} ledger={groundworks.ledger} />
	<p class="mt-4 text-xs text-mist-400">Islands, bars, holes, shelves, reeds, swims and the shoreline are all shaped in the editor.</p>
</section>
<WorksLedgerPanel inProgress={groundworks.inProgress} ledger={groundworks.ledger} />
