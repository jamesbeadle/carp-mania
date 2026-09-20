<script lang="ts">
	import type { Snippet } from 'svelte';
	import StatBar from './StatBar.svelte';

	interface Props {
		label: string;
		value: string;
		caption?: string;
		verdict?: string;
		share?: number | null;
		tone?: 'volt' | 'surge' | 'warning' | 'danger' | 'mist';
		why?: Snippet;
	}

	let { label, value, caption = '', verdict = '', share = null, tone = 'volt', why }: Props = $props();

	const ValueTone = { volt: 'text-volt-300', surge: 'text-surge-300', warning: 'text-warning-500', danger: 'text-danger-400', mist: 'text-mist-100' } as const;
</script>

<div class="@container min-w-0 rounded-xl border border-carbon-700/60 bg-carbon-900/60 p-3 sm:p-4">
	<div class="flex flex-col gap-2 @min-[22rem]:flex-row @min-[22rem]:items-start @min-[22rem]:gap-5">
		<div class="flex min-w-0 flex-col gap-1 @min-[22rem]:w-40 @min-[22rem]:shrink-0">
			<p class="stat-label">{label}</p>
			<p class="flex flex-wrap items-baseline gap-x-2">
				<span class="font-display text-3xl leading-none font-extrabold italic tabular-nums {ValueTone[tone]}">{value}</span>
				{#if caption}<span class="text-xs text-mist-400">{caption}</span>{/if}
			</p>
			{#if share !== null}<StatBar {share} {tone} />{/if}
		</div>
		<div class="flex min-w-0 flex-1 flex-col gap-1 @min-[22rem]:pt-4">
			{#if verdict}<p class="text-sm leading-snug text-mist-100">{verdict}</p>{/if}
			{#if why}
				<details class="group text-xs text-mist-400">
					<summary class="cursor-pointer list-none font-display font-bold tracking-wide text-mist-400 uppercase transition select-none hover:text-mist-100 [&::-webkit-details-marker]:hidden">Why <span class="inline-block transition group-open:rotate-90">▸</span></summary>
					<div class="mt-1 leading-relaxed">{@render why()}</div>
				</details>
			{/if}
		</div>
	</div>
</div>
