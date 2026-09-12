<script lang="ts">
	import { TheGameHasGrown } from '$lib/components/world/theGameHasGrown';

	let { lakeName }: { lakeName: string } = $props();
</script>

<section class="panel border-volt-500/40 md:col-span-2">
	<p class="stat-label">Your water is not on the map</p>
	<h2 class="mb-3 text-3xl text-volt-300">Put {lakeName} on the map</h2>
	<p class="text-mist-100">{TheGameHasGrown}</p>
	<p class="mt-2 text-sm text-mist-400">Until it is pinned, anglers cannot find it on the globe and you cannot bid for fish in the market.</p>
	<div class="mt-5 flex gap-3">
		<a href="/lake/pin" class="button-primary">Put it on the map</a>
	</div>
</section>
