<script lang="ts">
	import YouPill from './YouPill.svelte';

	interface Honour {
		key: string;
		label: string;
		detail: string;
		value: string;
		href: string;
	}

	interface Props {
		title: string;
		blurb: string;
		honours: Honour[];
		emptyWords: string;
		viewerId?: string | null;
	}

	let { title, blurb, honours, emptyWords, viewerId = null }: Props = $props();
</script>

<section class="panel">
	<h2 class="text-2xl text-volt-300">{title}</h2>
	<p class="mb-3 text-xs text-mist-400">{blurb}</p>
	{#if honours.length === 0}
		<p class="text-sm text-mist-400">{emptyWords}</p>
	{:else}
		<ol class="divide-y divide-carbon-700/60">
			{#each honours as honour, index (honour.key)}
				{@const isViewers = viewerId !== null && honour.key === viewerId}
				<li class={['flex items-baseline gap-3 py-2 text-sm', isViewers && '-mx-2 rounded-md bg-volt-500/10 px-2']}>
					<span class="w-6 font-display text-2xl font-extrabold text-surge-500 italic tabular-nums">{index + 1}</span>
					<span class="min-w-0">
						<a href={honour.href} class="text-mist-100 hover:underline">{honour.label}</a>
						{#if isViewers}<span class="ml-1"><YouPill /></span>{/if}
						<span class="block text-xs text-mist-400">{honour.detail}</span>
					</span>
					<span class="ml-auto whitespace-nowrap text-volt-300">{honour.value}</span>
				</li>
			{/each}
		</ol>
	{/if}
</section>
