<script lang="ts">
	interface Stat {
		label: string;
		value: string;
		caption?: string;
		tone?: 'volt' | 'mist';
	}

	let { stats }: { stats: Stat[] } = $props();
</script>

<dl class="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
	{#each stats as stat (stat.label)}
		<div class="min-w-0">
			<dt class="stat-label">{stat.label}</dt>
			<dd class="flex flex-wrap items-baseline gap-x-1.5">
				<span class="font-display text-2xl leading-none font-extrabold italic tabular-nums" class:text-volt-300={stat.tone === 'volt'} class:text-mist-100={stat.tone !== 'volt'}>{stat.value}</span>
				{#if stat.caption}<span class="text-xs text-mist-400">{stat.caption}</span>{/if}
			</dd>
		</div>
	{/each}
</dl>
