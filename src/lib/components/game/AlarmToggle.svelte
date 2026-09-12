<script lang="ts">
	let { isAlarmMuted = $bindable(false) }: { isAlarmMuted?: boolean } = $props();

	const label = $derived(isAlarmMuted ? 'Bite alarm muted — unmute' : 'Bite alarm on — mute');
</script>

<button class="flex h-9 w-9 items-center justify-center rounded-full border border-carbon-600 bg-carbon-900/80 transition hover:border-volt-400 active:scale-95" class:text-mist-400={isAlarmMuted} class:text-volt-300={!isAlarmMuted} onclick={() => (isAlarmMuted = !isAlarmMuted)} aria-label={label} title={label} aria-pressed={!isAlarmMuted}>
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
		<path d="M10 20a2 2 0 0 0 4 0" />
		{#if isAlarmMuted}<path d="M4 4l16 16" />{/if}
	</svg>
</button>
