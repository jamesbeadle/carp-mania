<script lang="ts">
	import type { Shoal } from '$lib/domain/stock/shoals';
	import type { Carp } from '$lib/domain/types';
	import { drawAnglerFactor, drawPayFactor, drawWords, stockDrawOf, stockRenownOf } from '$lib/domain/water/stockDraw';
	import StatTile from '../stats/StatTile.svelte';

	let { carp, shoals }: { carp: Carp[]; shoals: Shoal[] } = $props();

	const HolyGrailDraw = 60;
	const draw = $derived(stockDrawOf(carp, shoals));
	const anglers = $derived(drawAnglerFactor(draw).toFixed(2));
	const pay = $derived(drawPayFactor(draw).toFixed(2));
	const renown = $derived(Math.round(stockRenownOf(draw)));
	const verdict = $derived(capitalised(drawWords(draw)));

	function capitalised(words: string) {
		return words.charAt(0).toUpperCase() + words.slice(1);
	}
</script>

<StatTile label="The draw" value={String(Math.round(draw))} caption="anglers ×{anglers} · pay ×{pay}" share={draw / HolyGrailDraw} tone="surge" {verdict}>
	{#snippet why()}
		The draw is the pull of the fish in the water. Anglers travel for a size of fish — a thirty fills a car park, a forty makes a name, a fifty fills the diary — so it decides how many come, what they will pay, and where reputation settles (towards {renown} here).
	{/snippet}
</StatTile>
