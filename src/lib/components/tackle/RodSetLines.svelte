<script lang="ts">
	import { kitOf, type RodKit, type RodSetup } from '$lib/domain/tackle/rodSetup';

	let { title, rods }: { title: string; rods: RodSetup[] } = $props();

	const kits = $derived(rods.map((setup) => kitOf(setup)).filter((kit) => kit !== null));
	const headlineOf = (kit: RodKit) => [kit.rod, kit.reel].map((item) => item.label).join(' · ');
	const endTackleOf = (kit: RodKit) => [kit.line, kit.hook, kit.rig, kit.tubing, kit.bait].map((item) => item.label).join(' · ');
</script>

<div>
	<h3 class="stat-label mb-1">{title}</h3>
	<ol class="space-y-2">
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
</div>
