<script lang="ts">
	import { isStockedToOpen, restockingWords } from '$lib/domain/stock/stockedToOpen';

	let { fishCount, isOwner = false }: { fishCount: number; isOwner?: boolean } = $props();

	const isClosed = $derived(!isStockedToOpen(fishCount));
</script>

{#if isClosed}
	<p class="rounded-lg border border-danger-500/40 bg-danger-500/10 px-3 py-2 text-sm text-danger-400">
		{restockingWords(fishCount)}.
		{#if isOwner}<a href="/market/farms" class="underline">Buy from the farms</a>.{/if}
	</p>
{/if}
