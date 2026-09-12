<script lang="ts">
	import type { Lake } from '$lib/domain/types';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import SoundToggle from '../hud/SoundToggle.svelte';
	import AlarmToggle from './AlarmToggle.svelte';
	import FullscreenToggle from './FullscreenToggle.svelte';
	import SessionClock from './SessionClock.svelte';

	interface Props {
		lake: Lake;
		session: SessionState;
		isAlarmMuted: boolean;
		matchBoardHref: string | null;
		onHowToPlay: () => void;
	}

	let { lake, session, isAlarmMuted = $bindable(), matchBoardHref, onHowToPlay }: Props = $props();
</script>

<div class="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 lg:px-5 lg:pt-4">
	<div class="short:flex-row short:flex-wrap short:items-center short:gap-3 flex min-w-0 flex-col items-start gap-1.5">
		<a href="/lakes" class="rounded-full bg-carbon-950/45 px-3 py-1 text-xs text-mist-200 backdrop-blur transition hover:text-volt-300">← Leave the water</a>
		<h1 class="short:text-xl truncate text-2xl leading-none text-mist-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] lg:text-4xl">{lake.name}</h1>
		{#if matchBoardHref}<a href={matchBoardHref} class="rounded-full border border-volt-500/60 bg-carbon-950/45 px-3 py-1 text-xs text-volt-300 backdrop-blur transition hover:bg-volt-500/15">Match in play · the board</a>{/if}
		{#if session.phase !== 'choose_swim'}<SessionClock hour={session.hour} season={session.season} landed={session.landedToday.length} lost={session.lostToday} />{/if}
	</div>
	<div class="flex shrink-0 items-center gap-2">
		<button class="flex h-9 w-9 items-center justify-center rounded-full border border-carbon-600 bg-carbon-900/80 font-display text-lg font-bold text-mist-200 transition hover:border-volt-400 hover:text-volt-300 active:scale-95" onclick={onHowToPlay} aria-label="How to play" title="How to play">?</button>
		<AlarmToggle bind:isAlarmMuted />
		<SoundToggle />
		<FullscreenToggle />
	</div>
</div>
