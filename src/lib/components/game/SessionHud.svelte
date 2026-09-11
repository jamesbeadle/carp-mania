<script lang="ts">
	import { formatFishingHour } from '$lib/domain/fishing/sessionClock';
	import { BaitCatalogue } from '$lib/domain/tackle/baits';
	import { RigCatalogue } from '$lib/domain/tackle/rigs';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';

	let { session, isAlarmMuted = $bindable(false), onStrike }: { session: SessionState; isAlarmMuted?: boolean; onStrike: () => void } = $props();

	const phaseLabels = { idle: 'Not cast', cast: 'Fishing', biting: 'BITE!', fighting: 'Fish on' } as const;
</script>

<section class="panel space-y-3">
	<div class="flex items-baseline justify-between">
		<span class="font-display text-3xl text-volt-300">{formatFishingHour(session.hour)}</span>
		<span class="text-sm text-mist-400">{session.landedToday.length} landed · {session.lostToday} lost</span>
	</div>
	<label class="flex items-center gap-2 text-xs text-mist-400">
		<input type="checkbox" bind:checked={isAlarmMuted} class="accent-volt-500" /> Mute bite alarm
	</label>

	{#if session.bite}
		<button class="w-full animate-pulse rounded-xl bg-danger-500 px-4 py-4 text-xl font-bold text-mist-100" onclick={onStrike}>
			STRIKE! Rod {session.bite.rodIndex + 1} — {session.bite.secondsLeft.toFixed(1)}s
		</button>
	{:else if session.notice}
		<p class="rounded-xl bg-carbon-900 px-3 py-2 text-sm text-mist-200">{session.notice}</p>
	{/if}

	<ul class="space-y-2 text-sm">
		{#each session.rods as rod (rod.index)}
			<li class="flex items-center gap-2 rounded-lg bg-carbon-900 px-3 py-2" class:ring-2={rod.phase === 'biting'} class:ring-danger-400={rod.phase === 'biting'}>
				<span class="font-semibold">Rod {rod.index + 1}</span>
				<span class="text-mist-400">{RigCatalogue[rod.setup.rig].label} · {BaitCatalogue[rod.setup.bait].label}</span>
				<span class="ml-auto" class:text-volt-300={rod.phase === 'cast'} class:text-danger-400={rod.phase === 'biting'}>{phaseLabels[rod.phase]}</span>
			</li>
		{/each}
	</ul>
	<p class="text-xs text-mist-400">Click the water to cast the next uncast rod. Bites come more often at dawn and dusk.</p>
</section>
