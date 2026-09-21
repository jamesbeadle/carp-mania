<script lang="ts">
	let { share, isUnlocked, unlocksAt }: { share: number; isUnlocked: boolean; unlocksAt: number } = $props();

	const Dial = { Radius: 40, Circumference: 2 * Math.PI * 40, Size: 100, Stroke: 9 } as const;
	const centre = Dial.Size / 2;
	const percent = $derived(Math.round(share * 100));
	const dashOffset = $derived(Dial.Circumference * (1 - (isUnlocked ? share : 0)));
	const tone = $derived(percent >= 75 ? 'var(--color-volt-500)' : percent >= 50 ? 'var(--color-warning-500)' : 'var(--color-danger-500)');
</script>

<div class="flex shrink-0 flex-col items-center">
	<svg width={Dial.Size} height={Dial.Size} viewBox="0 0 {Dial.Size} {Dial.Size}" role="img" aria-label={isUnlocked ? `Match ${percent}%` : `Match readout unlocks at craft ${unlocksAt}`}>
		<circle cx={centre} cy={centre} r={Dial.Radius} fill="none" stroke="var(--color-carbon-950)" stroke-width={Dial.Stroke} />
		<circle cx={centre} cy={centre} r={Dial.Radius} fill="none" stroke={tone} stroke-width={Dial.Stroke} stroke-linecap="round" stroke-dasharray={Dial.Circumference} stroke-dashoffset={dashOffset} transform="rotate(-90 {centre} {centre})" />
		<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" class="fill-mist-100 font-display text-2xl font-extrabold italic">{isUnlocked ? `${percent}%` : '?'}</text>
	</svg>
	<p class="stat-label">Match</p>
	{#if !isUnlocked}<p class="text-center text-[0.65rem] text-mist-400">craft {unlocksAt}</p>{/if}
</div>
