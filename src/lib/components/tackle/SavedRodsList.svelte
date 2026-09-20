<script lang="ts">
	import { kitOf, type RodKit, type RodSetup } from '$lib/domain/tackle/rodSetup';

	let { savedRods }: { savedRods: RodSetup[] } = $props();

	const kits = $derived(savedRods.map((setup) => kitOf(setup)).filter((kit) => kit !== null));
	const headlineOf = (kit: RodKit) => [kit.rod, kit.reel].map((item) => item.label).join(' · ');
	const endTackleOf = (kit: RodKit) => {
		const items = [kit.line, kit.hook, kit.rig, kit.tubing, kit.bait];
		return items.map((item) => item.label).join(' · ');
	};
</script>

<section class="panel">
	<h2 class="text-xl text-volt-300">Saved rods</h2>
	<p class="mt-1 text-sm text-mist-400">The rods you last fished with — set up again, and changed, when you next tackle up.</p>
	{#if kits.length === 0}
		<p class="mt-2 text-sm text-mist-400">None yet — tackle up on a water and they are remembered.</p>
	{:else}
		<ol class="mt-2 space-y-2">
			{#each kits as kit, index (index)}
				<li class="flex gap-x-3 text-sm">
					<span class="stat-label w-14 shrink-0 pt-0.5">Rod {index + 1}</span>
					<div class="min-w-0 flex-1">
						<p class="font-medium text-mist-100">{headlineOf(kit)}</p>
						<p class="text-xs text-mist-400">{endTackleOf(kit)}</p>
					</div>
				</li>
			{/each}
		</ol>
	{/if}
</section>
