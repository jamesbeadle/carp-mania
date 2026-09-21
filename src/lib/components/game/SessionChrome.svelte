<script lang="ts">
	import type { Lake } from '$lib/domain/types';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import FullscreenToggle from '../hud/FullscreenToggle.svelte';
	import SoundToggle from '../hud/SoundToggle.svelte';
	import AlarmToggle from './AlarmToggle.svelte';
	import SessionClock from './SessionClock.svelte';
	import StreakPill from './StreakPill.svelte';
	import WeatherLine from './WeatherLine.svelte';

	interface Props {
		lake: Lake;
		session: SessionState;
		isAlarmMuted: boolean;
		onHowToPlay: () => void;
	}

	let { lake, session, isAlarmMuted = $bindable(), onHowToPlay }: Props = $props();

	const isOnTheBank = $derived(session.phase !== 'choose_swim');
</script>

<div class="short:gap-y-1 short:p-2 flex flex-wrap items-center gap-x-3 gap-y-2 p-3 lg:px-5 lg:pt-4">
	<div class="short:flex-row short:items-center short:gap-3 order-1 flex min-w-0 flex-1 flex-col items-start gap-1.5">
		<a href="/lakes" class="rounded-full bg-carbon-950/45 px-3 py-1 text-xs whitespace-nowrap text-mist-200 backdrop-blur transition hover:text-volt-300">← Leave the water</a>
		<h1 class="short:text-xl max-w-full truncate text-2xl leading-none text-mist-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] lg:text-4xl">{lake.name}</h1>
	</div>
	<div class="short:order-3 order-2 flex shrink-0 items-center gap-2">
		<button class="flex h-9 w-9 items-center justify-center rounded-full border border-carbon-600 bg-carbon-900/80 font-display text-lg font-bold text-mist-200 transition hover:border-volt-400 hover:text-volt-300 active:scale-95" onclick={onHowToPlay} aria-label="How to play" title="How to play">?</button>
		<AlarmToggle bind:isAlarmMuted />
		<SoundToggle />
		<FullscreenToggle />
	</div>
	{#if isOnTheBank}
		<div class="short:order-2 short:basis-auto order-3 min-w-0 basis-full">
			<div class="inline-flex max-w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-carbon-700 bg-carbon-950/80 px-3 py-1.5 backdrop-blur sm:px-4">
				<SessionClock hour={session.hour} window={session.window} season={session.season} landed={session.landedToday.length} lost={session.lostToday} />
				<StreakPill streakDays={session.streakDays} />
				<WeatherLine weather={session.weather} hour={session.hour} />
			</div>
		</div>
	{/if}
</div>
