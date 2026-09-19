<script lang="ts">
	import type { Shoal } from '$lib/domain/stock/shoals';
	import type { Carp } from '$lib/domain/types';
	import { drawAnglerFactor, drawPayFactor, drawWords, stockDrawOf, stockRenownOf } from '$lib/domain/water/stockDraw';

	let { carp, shoals }: { carp: Carp[]; shoals: Shoal[] } = $props();

	const draw = $derived(stockDrawOf(carp, shoals));
	const anglers = $derived(drawAnglerFactor(draw).toFixed(2));
	const pay = $derived(drawPayFactor(draw).toFixed(2));
	const renown = $derived(Math.round(stockRenownOf(draw)));
</script>

<div class="rounded-xl border border-carbon-700/60 bg-carbon-900/60 p-4">
	<p class="stat-label">The draw</p>
	<p class="text-2xl text-volt-300">{Math.round(draw)} <span class="text-base text-mist-200">· {drawWords(draw)}</span></p>
	<p class="mt-1 text-xs text-mist-400">Anglers ×{anglers} · they pay ×{pay} · reputation settles towards {renown}. Anglers travel for a size of fish: a thirty fills a car park, a forty makes a name, a fifty fills the diary.</p>
</div>
