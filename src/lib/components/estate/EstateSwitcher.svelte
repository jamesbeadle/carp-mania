<script lang="ts">
	import { enhance } from '$app/forms';
	import { Estate, whyCannotBuyAnotherWater } from '$lib/domain/estate/estateRules';
	import type { Lake } from '$lib/domain/types';
	import BuyAnotherWaterLink from './BuyAnotherWaterLink.svelte';

	type Water = Pick<Lake, 'id' | 'name' | 'is_setup_complete'>;

	interface Props {
		waters: Water[];
		currentId: string;
		returnTo: '/home' | '/lake';
		isCompact?: boolean;
	}

	let { waters, currentId, returnTo, isCompact = false }: Props = $props();

	const refusal = $derived(whyCannotBuyAnotherWater(waters));
</script>

<section class="flex flex-wrap items-center gap-2">
	{#if !isCompact}<span class="stat-label mr-1">{waters.length === 1 ? 'Your water' : `Your estate · ${waters.length} of ${Estate.MostWaters}`}</span>{/if}
	{#each waters as water (water.id)}
		{@const isCurrent = water.id === currentId}
		<form method="POST" action="{returnTo}?/switchWater" use:enhance>
			<input type="hidden" name="lakeId" value={water.id} />
			<input type="hidden" name="returnTo" value={returnTo} />
			<button
				class="rounded-full border px-3 py-1 font-display text-sm font-bold tracking-wide uppercase transition active:scale-95"
				class:border-volt-500={isCurrent}
				class:bg-volt-500={isCurrent}
				class:text-carbon-950={isCurrent}
				class:border-carbon-600={!isCurrent}
				class:text-mist-200={!isCurrent}
				class:hover:border-volt-400={!isCurrent}
				aria-current={isCurrent ? 'true' : undefined}
				disabled={isCurrent}
			>
				{water.name}{#if !water.is_setup_complete}<span class="font-normal normal-case">&nbsp;· setting up</span>{/if}
			</button>
		</form>
	{/each}
	{#if !isCompact}<BuyAnotherWaterLink {refusal} />{/if}
</section>
