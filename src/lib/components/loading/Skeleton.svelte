<script lang="ts">
	interface Props {
		title?: string;
		rows?: number;
		isBare?: boolean;
	}

	let { title, rows = 4, isBare = false }: Props = $props();

	const RowWidths = ['w-11/12', 'w-4/5', 'w-2/3', 'w-3/4', 'w-1/2'] as const;

	const widths = $derived(Array.from({ length: rows }, (_, index) => RowWidths[index % RowWidths.length]));
</script>

<div class={isBare ? 'animate-pulse' : 'panel animate-pulse'} role="status" aria-busy="true" aria-label={title ? `Loading ${title}` : 'Loading'}>
	{#if title}<h3 class="mb-3 text-xl text-mist-400/70">{title}</h3>{/if}
	<div class="space-y-2.5">
		{#each widths as width, index (index)}
			<div class="h-3.5 rounded-full bg-carbon-600/70 {width}"></div>
		{/each}
	</div>
</div>
