<script module lang="ts">
	export type FlyToTarget = 'my_water' | 'biggest_fish' | 'somewhere_new';
</script>

<script lang="ts">
	interface Props {
		hasMyWater: boolean;
		hasPins: boolean;
		onFlyTo: (target: FlyToTarget) => void;
	}

	let { hasMyWater, hasPins, onFlyTo }: Props = $props();

	const destinations: { target: FlyToTarget; label: string; isAvailable: boolean }[] = $derived([
		{ target: 'my_water', label: 'My water', isAvailable: hasMyWater },
		{ target: 'biggest_fish', label: 'Biggest fish alive', isAvailable: hasPins },
		{ target: 'somewhere_new', label: 'Somewhere new', isAvailable: true }
	]);
</script>

<div>
	<p class="stat-label mb-1">Fly to</p>
	<ul class="flex flex-col gap-1">
		{#each destinations as destination (destination.target)}
			<li>
				<button
					class="w-full rounded-md border border-carbon-700 px-3 py-1.5 text-left font-display text-base font-bold tracking-wide text-mist-100 uppercase italic transition hover:border-volt-500 hover:text-volt-300 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={!destination.isAvailable}
					onclick={() => onFlyTo(destination.target)}
				>
					▸ {destination.label}
				</button>
			</li>
		{/each}
	</ul>
</div>
