<script lang="ts">
	import type { MatchPhase } from '$lib/domain/matches/matchTypes';
	import { MatchPhaseWords } from '$lib/game/matches/matchWords';

	let { phase }: { phase: MatchPhase } = $props();

	const Tones: Record<MatchPhase, string> = {
		upcoming: 'border-surge-500/60 text-surge-400',
		in_play: 'border-volt-500/70 bg-volt-500/15 text-volt-300 animate-pulse',
		ended: 'border-volt-500/40 text-volt-300',
		settled: 'border-carbon-600 text-mist-200',
		cancelled: 'border-danger-500/60 text-danger-400'
	};
</script>

<span class="whitespace-nowrap rounded-full border px-2.5 py-0.5 font-display text-xs font-bold tracking-widest uppercase {Tones[phase]}">{MatchPhaseWords[phase]}</span>
