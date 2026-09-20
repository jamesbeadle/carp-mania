<script lang="ts">
	interface Stat {
		label: string;
		value: string;
		caption?: string;
		tone?: 'volt' | 'surge' | 'warning' | 'danger' | 'mist';
	}

	let { stats }: { stats: Stat[] } = $props();

	const ValueTone = { volt: 'text-volt-300', surge: 'text-surge-300', warning: 'text-warning-500', danger: 'text-danger-400', mist: 'text-mist-100' } as const;
</script>

<dl class="grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-x-4 gap-y-3">
	{#each stats as stat (stat.label)}
		<div class="min-w-0">
			<dt class="stat-label">{stat.label}</dt>
			<dd class="flex flex-wrap items-baseline gap-x-1.5">
				<span class="font-display text-2xl leading-none font-extrabold italic tabular-nums {ValueTone[stat.tone ?? 'mist']}">{stat.value}</span>
				{#if stat.caption}<span class="text-xs text-mist-400">{stat.caption}</span>{/if}
			</dd>
		</div>
	{/each}
</dl>
