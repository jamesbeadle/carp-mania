<script lang="ts">
	const steps = [
		{ title: 'Choose a swim', detail: 'Each peg has a bottom (gravel, clay or silt), a depth and a feature. Weedy, silty corners want a chod or helicopter rig; clean gravel bars fish a Ronnie or spinner well.' },
		{ title: 'Tackle up', detail: 'Up to three rods. Clear line hides in clear water; coloured line hides in coloured water. Matt hooks, size 4 or 6. Fish the bait the lake has been fed on. Your setup is remembered.' },
		{ title: 'Cast', detail: 'Click the water once per rod. You cannot cast through the island. Dawn and dusk are the best hours.' },
		{ title: 'Strike', detail: 'When the alarm screams, click STRIKE or press Enter within four seconds. A size 8 hook drops a lot of fish on the strike.' },
		{ title: 'Play the fish', detail: 'Hold REEL or Space while the fish is tiring and the marker climbs. When it says the fish is running, let go — it takes line and the marker drops. Too tight snaps the line, too slack and the hook falls out.' },
		{ title: 'On the mat', detail: 'Every landed carp is photographed and posted to the lake. Your skills go up, the fishery reputation goes up, and the fish is on your record.' }
	];
</script>

<details class="panel group">
	<summary class="cursor-pointer font-display text-lg font-bold tracking-wide text-volt-300 uppercase select-none">How to play <span class="text-mist-400 group-open:hidden">— show</span><span class="hidden text-mist-400 group-open:inline">— hide</span></summary>
	<ol class="mt-4 grid gap-4 md:grid-cols-2">
		{#each steps as step, index (step.title)}
			<li class="flex gap-3">
				<span class="font-display text-3xl font-extrabold text-surge-500 italic tabular-nums">{index + 1}</span>
				<div><h4 class="font-display text-base font-bold tracking-wide text-mist-100 uppercase">{step.title}</h4><p class="text-sm text-mist-400">{step.detail}</p></div>
			</li>
		{/each}
	</ol>
</details>
