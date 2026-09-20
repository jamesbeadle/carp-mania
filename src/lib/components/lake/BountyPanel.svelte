<script lang="ts">
	import type { BountyCard as BountyOnTheWater } from '$lib/contracts/Bounties';
	import type { Carp } from '$lib/domain/types';
	import BountyCard from '../world/BountyCard.svelte';
	import PostBountyForm from './PostBountyForm.svelte';

	let { carp, bounties }: { carp: Carp[]; bounties: BountyOnTheWater[] } = $props();

	const open = $derived(bounties.find((bounty) => bounty.status === 'open') ?? null);
	const settled = $derived(bounties.filter((bounty) => bounty.status === 'won'));
</script>

<section class="panel space-y-4">
	<h3 class="text-xl text-volt-300">Bounties</h3>
	{#if open}
		<BountyCard bounty={open} isOnTheWater />
		<p class="text-xs text-mist-400">One bounty at a time — post your own when this one closes.</p>
	{:else}
		<PostBountyForm {carp} />
	{/if}
	{#if settled.length > 0}
		<ul class="space-y-2">
			{#each settled as bounty (bounty.id)}<li><BountyCard {bounty} isOnTheWater /></li>{/each}
		</ul>
	{/if}
</section>
