<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		title: string;
		isOpen: boolean;
		onClose: () => void;
		children: Snippet;
	}

	let { title, isOpen, onClose, children }: Props = $props();

	const Slide = { Milliseconds: 260, Distance: 48 } as const;

	function closeOnEscape(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) onClose();
	}
</script>

<svelte:window onkeydown={closeOnEscape} />

{#if isOpen}
	<div class="fixed inset-0 z-40 bg-carbon-950/55 backdrop-blur-[2px]" transition:fade={{ duration: Slide.Milliseconds }} onclick={onClose} role="presentation"></div>
	<div
		class="sheet fixed inset-x-0 bottom-0 z-50 flex max-h-[82dvh] flex-col rounded-t-3xl border-t border-carbon-600 bg-carbon-900 shadow-2xl shadow-carbon-950 lg:inset-x-auto lg:inset-y-0 lg:right-0 lg:max-h-none lg:w-[28rem] lg:rounded-none lg:rounded-l-3xl lg:border-t-0 lg:border-l"
		transition:fly={{ y: Slide.Distance, duration: Slide.Milliseconds }}
		role="dialog"
		aria-label={title}
	>
		<div class="flex justify-center pt-3 pb-1 lg:hidden"><span class="h-1.5 w-12 rounded-full bg-carbon-600" aria-hidden="true"></span></div>
		<div class="flex items-center justify-between px-5 pt-3 pb-3">
			<h2 class="text-2xl text-volt-300">{title}</h2>
			<button class="rounded-full border border-carbon-600 px-3 py-1 text-sm text-mist-200 transition hover:border-volt-400 hover:text-volt-300 active:scale-95" onclick={onClose}>Close</button>
		</div>
		<div class="sheet-body space-y-4 overflow-y-auto px-5 pb-6">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.sheet-body {
		padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
	}
</style>
