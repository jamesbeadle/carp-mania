<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { formatMoney } from '$lib/format/money';
	import { sound } from '$lib/game/sound/soundEngine.svelte';

	let { money }: { money: number } = $props();

	const CountUp = { Milliseconds: 900 } as const;
	const shown = Tween.of(() => money, { duration: CountUp.Milliseconds, easing: cubicOut });
	let lastMoney = money;

	$effect(() => {
		if (money === lastMoney) return;
		lastMoney = money;
		sound.play('coins');
	});
</script>

<a href="/lake" class="flex items-center gap-1.5 rounded-full border border-volt-500/40 bg-carbon-900/80 px-3 py-1 font-display text-lg font-bold tracking-wide text-volt-300 tabular-nums transition hover:border-volt-400 active:scale-95" aria-label="Money in the bank">
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v9M9.5 10a2.5 2 0 0 1 5 0c0 2-5 2-5 4a2.5 2 0 0 0 5 0" /></svg>
	{formatMoney(Math.round(shown.current))}
</a>
