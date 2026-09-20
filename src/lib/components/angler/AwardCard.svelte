<script lang="ts">
	import { AwardCatalogue, type AwardKey } from '$lib/domain/trophies/awards';
	import { formatWhen } from '$lib/format/dates';

	let { key, wonAt, isCompact = false }: { key: AwardKey; wonAt: string | null; isCompact?: boolean } = $props();

	const award = $derived(AwardCatalogue[key]);
	const isWon = $derived(wonAt !== null);
</script>

<li class={['rounded-xl border px-3 py-2', isWon ? 'border-volt-500/50 bg-volt-500/10' : 'border-carbon-700 opacity-60']} title={award.words}>
	<p class={['font-display text-base font-bold tracking-wide uppercase', isWon ? 'text-volt-300' : 'text-mist-400']}>{award.label}</p>
	{#if !isCompact}<p class="text-xs text-mist-300">{award.words}</p>{/if}
	<p class="text-xs text-mist-400">{wonAt ? formatWhen(wonAt) : 'not yet'}</p>
</li>
