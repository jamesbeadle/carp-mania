<script lang="ts">
	interface FacetOption {
		value: string;
		label: string;
	}

	let {
		name,
		label,
		value,
		options,
		anyLabel = 'Any',
		onchange
	}: { name: string; label: string; value: string; options: FacetOption[]; anyLabel?: string | null; onchange: () => void } = $props();
</script>

<label class="flex flex-col gap-1 text-xs text-mist-400">
	{label}
	<select {name} {value} {onchange} class="field w-auto py-1.5 text-sm">
		{#if anyLabel !== null}<option value="">{anyLabel}</option>{/if}
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</label>
