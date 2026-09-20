<script lang="ts">
	let { share, tone = 'volt' }: { share: number; tone?: 'volt' | 'surge' | 'warning' | 'danger' | 'mist' } = $props();

	const FillTone = { volt: 'from-volt-500 to-surge-500', surge: 'from-surge-500 to-surge-300', warning: 'from-warning-500 to-volt-400', danger: 'from-danger-500 to-warning-500', mist: 'from-mist-400 to-mist-200' } as const;
	const width = $derived(Math.round(Math.min(1, Math.max(0, share)) * 100));
</script>

<span class="track block h-1.5 w-full overflow-hidden rounded-full" role="img" aria-label="{width}%">
	<span class="block h-full rounded-full bg-gradient-to-r {FillTone[tone]}" style="width: {width}%"></span>
</span>

<style>
	.track {
		background: color-mix(in srgb, var(--color-mist-400) 22%, transparent);
	}
</style>
