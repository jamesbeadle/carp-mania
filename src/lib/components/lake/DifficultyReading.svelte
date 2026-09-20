<script lang="ts">
	import { difficultyWord, lakeDifficultyOf, whatWouldEaseIt, type DifficultyReading as DifficultyReadingShares } from '$lib/domain/lakeDifficulty';
	import type { Shoal } from '$lib/domain/stock/shoals';
	import { headCountIn } from '$lib/domain/stock/headCount';
	import type { Carp, Lake } from '$lib/domain/types';
	import StatTile from '../stats/StatTile.svelte';

	interface Props {
		lake: Lake;
		carp: Carp[];
		shoals: Shoal[];
		isOwner?: boolean;
	}

	let { lake, carp, shoals, isOwner = false }: Props = $props();

	const EasiestDifficulty = 100;
	const reading = $derived(lakeDifficultyOf(lake, headCountIn(carp, shoals)));
	const word = $derived(difficultyWord(reading.difficulty));
	const percent = (factor: number) => Math.round(factor * 100);
	const factorWords = $derived(sharesOf(reading).map(([name, factor]) => `${name} ${percent(factor)}%`).join(' · '));
	const verdict = $derived(isOwner ? capitalised(whatWouldEaseIt(reading)) : 'The good spots are fewer and further apart on a hard water, and the big fish are on them');

	function sharesOf(read: DifficultyReadingShares) {
		const { sizeSpread, stockingFactor, featureFactor, qualityFactor } = read;
		return [['size', sizeSpread], ['stocking', stockingFactor], ['features', featureFactor], ['water', qualityFactor]] as const;
	}

	function capitalised(words: string) {
		return words.charAt(0).toUpperCase() + words.slice(1);
	}
</script>

<StatTile label="Difficulty" value={String(reading.difficulty)} caption={word} share={reading.difficulty / EasiestDifficulty} tone="warning" {verdict}>
	{#snippet why()}
		{factorWords}. A hard water does not give up fewer fish — the good spots are simply fewer and further apart, and the big fish are on them.
	{/snippet}
</StatTile>
